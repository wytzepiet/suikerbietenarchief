import { Button } from "@/components/ui/button";
import { A, action } from "@solidjs/router";
import { Save, Sparkles, Trash, Trash2, Upload, VideoIcon } from "lucide-solid";

import { supabase } from "@/libs/services/supabase/client";
import {
  For,
  Suspense,
  createEffect,
  createResource,
  createSignal,
} from "solid-js";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  TextField,
  TextFieldLabel,
  TextFieldRoot,
} from "@/components/ui/textfield";
import { Separator } from "@/components/ui/separator";
import MuxPlayer from "@/components/muxPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle, { pageTitle } from "@/components/pageTitle";

import { confirmWithDailog } from "@/components/confirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TextArea } from "@/components/ui/textarea";
import { getTranscript } from "@/libs/services/assemblyai/utils";
import { Video, createVideo } from "@/libs/models/video";
import { Image, ImageFallback, ImageRoot } from "@/components/ui/image";
import { Tables } from "@/libs/services/supabase/types";

// async function synchoniseWithMux() {
//   "use server";
//   const muxVideos = await mux.video.assets.list();
//   if (!muxVideos) return;
//   const vids = .from("videos");

//   muxVideos.data.forEach(async (muxVideo) => {
//     const { data, error } = await vids.select().eq("asset_id", muxVideo.id);
//     if (error) {
//       console.error("Error fetching video document:", error);
//     }
//     console.log("data: ", data);
//     if (data?.length === 0) {
//       const response = await vids.insert({
//         asset_id: muxVideo.id,
//         playback_id: muxVideo.playback_ids?.at(0)?.id,
//       });
//       console.log("response: ", response);
//     }
//   });
// }

export default function Videos() {
  const [videos, { refetch }] = createResource(async () => {
    const vids = await supabase.from("videos").select().neq("asset_id", null);
    return vids.data?.map((video) => {
      const vid = createVideo(video);
      vid.onDelete.push(() => {
        refetch();
        console.log("deleted" + video.title);
      });
      return vid;
    });
  });

  createEffect(() => {
    videos()?.forEach(async (video) => {
      if (!video.data.transcript_id) {
        console.log("No transcript ID found for video: ", video.data.title);
        return;
      }
      const transcript = await getTranscript(video.data.transcript_id ?? "");
      if (!transcript.text)
        console.log("No transcript text found for video: ", video.data.title);
      // if (video.playback_id) transcribe(video.playback_id);
    });
  });

  return (
    <main>
      <PageTitle>Video's</PageTitle>
      <CardHeader>
        <div class="flex justify-between">
          <CardTitle class="text-2xl">{pageTitle()}</CardTitle>
          <div class="flex gap-4">
            <A href="/admin/upload">
              <Button class="flex gap-2 items-center">
                <Upload size="1.2em" strokeWidth={3} />
                Upload video's
              </Button>
            </A>
          </div>
        </div>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <TextFieldRoot>
          <TextField placeholder="Zoek video's" />
        </TextFieldRoot>
        <div class="flex flex-col gap-1">
          <Suspense
            fallback={Array.from({ length: 9 }).map((_, i) => (
              <Skeleton delay={i * 100} class="h-[50px] p-1 box-content" />
            ))}
          >
            <For each={videos()}>
              {(video) => <VideoListItem video={video} />}
            </For>
          </Suspense>
        </div>
      </CardContent>
    </main>
  );
}

function VideoListItem({ video }: { video: Video }) {
  const [open, setOpen] = createSignal(false);
  let hasChanged = false;
  const handleChange = () => (hasChanged = true);

  const setSheetOpen = async (value: boolean) => {
    if (!open()) hasChanged = false;
    if (hasChanged) {
      const confirmed = await confirmWithDailog({
        title: "Weet je zeker dat je wilt sluiten?",
        description: "Je hebt nog niet opgeslagen wijzigingen.",
        confirm: "Sluiten",
      });
      hasChanged = !confirmed;
    }
    if (!hasChanged) setOpen(value);
    if (open()) video.refetch();
  };

  const saveVideo = action(async (data: FormData) => {
    data.forEach((value, key) => {
      if (!(key in video.data)) return;
      video.update(key as keyof Tables<"videos">, String(value));
    }, video.data.id?.toString());

    console.log(video.data.id);

    const vid = await supabase
      .from("videos")
      .update(video.data)
      .eq("id", video.data.id!)
      .select()
      .single();

    setOpen(false);
  }, video.data.id?.toString());

  async function deleteVideo() {
    const confirmed = await confirmWithDailog(
      {
        title: "Weet je zeker dat je wilt verwijderen?",
        description: "Deze actie kan niet ongedaan worden gemaakt.",
        confirm: "Verwijderen",
      },
      { variant: "destructive" }
    );
    if (confirmed) {
      video.deleteEverywhere();
      setOpen(false);
    }
  }

  function secondsToHms(d: number = 0) {
    const hms = [d / 3600, (d % 3600) / 60, (d % 3600) % 60];
    return hms.map((t) => Math.floor(t).toString().padStart(2, "0")).join(":");
  }

  const [transcript, setTranscript] = createSignal<string | null>(null);
  getTranscript(video.data.transcript_id!).then((t) => setTranscript(t.text!));

  const [newKeyword, setNewKeyword] = createSignal<string>("");
  function addKeyword() {
    if (newKeyword()) video.addKeyword(newKeyword()!);
  }

  return (
    <Sheet open={open()} onOpenChange={setSheetOpen}>
      <SheetTrigger class="flex gap-4 items-center p-1 hover:bg-muted rounded-md">
        <ImageRoot class="h-12 w-12 rounded">
          <ImageFallback>
            <VideoIcon />
          </ImageFallback>
          <Image
            src={video.thumbnailUrl({ width: 100 })}
            alt={video.data.title ?? "Video thumbnail"}
          ></Image>
        </ImageRoot>

        <div class="text-left">
          <p>{video.data.title ?? "Geen titel"}</p>
          <p class="text-muted-foreground text-sm justify-self-end text-ellipsis line-clamp-1">
            {secondsToHms(video.data.duration ?? 0)} - {video.data.description}
          </p>
        </div>
      </SheetTrigger>
      <SheetContent class="flex flex-col gap-4 w-[400px] overflow-y-scroll pb-0">
        <SheetHeader>
          <SheetTitle>Bewerk video</SheetTitle>
          <SheetDescription>
            {/* Video wordt gepubliceerd wanneer de upload klaar is. */}
          </SheetDescription>
        </SheetHeader>

        <div class="border rounded overflow-hidden shrink-0">
          <MuxPlayer
            playbackId={video.data.playback_id ?? ""}
            aspectRatio={video.data.aspect_ratio}
          />
        </div>
        <form class="flex flex-col gap-8" action={saveVideo} method="post">
          <TextFieldRoot>
            <TextFieldLabel>Titel</TextFieldLabel>
            <TextField
              name="title"
              value={video.data.title ?? ""}
              onInput={handleChange}
            ></TextField>
          </TextFieldRoot>

          <TextFieldRoot>
            <TextFieldLabel class="flex justify-between items-end">
              Beschrijving{" "}
              <Button
                size="sm"
                variant="ghost"
                type="submit"
                class="self-start"
              >
                <Sparkles size="1.25em" class="mr-1" /> genereren met AI
              </Button>
            </TextFieldLabel>
            <TextArea
              autoResize
              name="description"
              value={video.data.description ?? ""}
            />
          </TextFieldRoot>

          <div class="flex flex-col gap-2">
            {video.data.keywords?.map((keyword, i) => {
              return (
                <div class="text-sm flex gap-2">
                  <TextFieldRoot class="grow">
                    <TextField
                      name={"keyword-" + i}
                      value={keyword}
                    ></TextField>
                  </TextFieldRoot>
                  <Button variant="ghost" size="icon">
                    <Trash2 size="1.25em" />
                  </Button>
                </div>
              );
            })}
            <div class="text-sm flex gap-2">
              <TextFieldRoot
                class="grow"
                value={newKeyword()}
                onChange={setNewKeyword}
                onSubmit={addKeyword}
              >
                <TextField placeholder="Trefwoord toevoegen..."></TextField>
              </TextFieldRoot>
              <Button variant="secondary" size="icon" onClick={addKeyword}>
                <Save size="1.25em" />
              </Button>
            </div>
          </div>

          <div class="flex gap-4 sticky bottom-0 border-t py-4 bg-background">
            <Button
              type="submit"
              class="flex items-center gap-1"
              onClick={() => setOpen(false)}
            >
              <Save size="1.25em" />
              Opslaan
            </Button>
            <Separator orientation="vertical" />
            <Button
              variant="destructive"
              class="self-start flex items-center gap-1"
              onclick={deleteVideo}
            >
              <Trash2 size="1.25em" /> Verwijderen
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

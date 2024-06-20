import { Button } from "@/components/ui/button";
import { A, action } from "@solidjs/router";
import { Sparkles, Upload } from "lucide-solid";

import { supabase } from "@/libs/supabase/client";
import {
  For,
  Show,
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
import { Tables } from "@/libs/supabase/types";
import MuxPlayer from "@/components/muxPlayer";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle, { pageTitle } from "@/components/pageTitle";

import { confirmWithDailog } from "@/components/confirmDialog";
import { SetStoreFunction, createStore } from "solid-js/store";
import {
  Switch,
  SwitchControl,
  SwitchLabel,
  SwitchThumb,
} from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { TextArea } from "@/components/ui/textarea";
import { getTranscript, transcribe } from "@/libs/assemblyai/utils";
import { generateMetadata } from "@/libs/video/generatemetadata";
import { deleteMuxVideo } from "@/libs/mux/utils";
import { VideoData, VideoRecord } from "@/libs/models/video";

// async function synchoniseWithMux() {
//   "use server";
//   const muxVideos = await mux.video.assets.list();
//   if (!muxVideos) return;
//   const vids = supabase().from("videos");

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
  const [videos, { refetch, mutate }] = createResource(async () => {
    const vids = await supabase().from("videos").select().neq("asset_id", null);
    return vids.data?.map((video) => {
      const vid = new VideoRecord(video);
      vid.onDelete.push(() => {
        mutate(videos()?.filter((v) => v.data.id !== video.id));
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
            <For each={videos()}>{(video) => <Video video={video} />}</For>
          </Suspense>
        </div>
      </CardContent>
    </main>
  );
}

function Video<T extends VideoData>({ video }: { video: VideoRecord<T> }) {
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
  };

  const saveVideo = action(async (data: FormData) => {
    data.forEach((value, key) => {
      if (!(key in video.data)) return;
      // @ts-ignore
      video.setData(key, String(value));
    }, video.data.id?.toString());

    console.log(video.data.id);

    const vid = await supabase()
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
    if (confirmed) video.delete();
  }

  function secondsToHms(d: number = 0) {
    const hms = [d / 3600, (d % 3600) / 60, (d % 3600) % 60];
    return hms.map((t) => Math.floor(t).toString().padStart(2, "0")).join(":");
  }

  const [transcript, setTranscript] = createSignal<string | null>(null);
  getTranscript(video.data.transcript_id!).then((t) => setTranscript(t.text!));

  (async (video: Partial<Tables<"videos">>) => {
    if (!video.generate_description) return;
    if (!video.transcript_id) return;
    const transcript = await getTranscript(video.transcript_id);

    if (!transcript.text) {
      console.error("Error fetching transcript text for video:", video.title);
      // transcribe(video.playback_id!);
    }
    // console.log(video.title, video.prompt_hint, transcript.text);
    // const metadata = await generateMetadata(
    //   video.title,
    //   video.prompt_hint,
    //   transcript.text
    // );
    // if (metadata) {
    //   supabase().from("videos").update(metadata).eq("id", video.id);
    // }
  })({ ...video.data });

  return (
    <Sheet open={open()} onOpenChange={setSheetOpen}>
      <SheetTrigger class="flex gap-4 items-center p-1 hover:bg-muted rounded-md">
        <img
          class="h-12 aspect-square rounded object-cover"
          src={video.thumbnailUrl({ width: 100 })}
          alt={video.data.title ?? "Video thumbnail"}
        />
        <div class="text-left">
          <p>{video.data.title ?? "Geen titel"}</p>
          <p class="text-muted-foreground text-sm justify-self-end">
            {secondsToHms(video.data.duration ?? 0)}
          </p>
        </div>
      </SheetTrigger>
      <SheetContent class="flex flex-col gap-4 w-[400px] overflow-y-scroll">
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
          <Separator />

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
            <TextArea name="description" value={video.data.description ?? ""} />
          </TextFieldRoot>
          <TextFieldRoot>
            <TextFieldLabel class="flex justify-between items-end">
              Gpt hint
            </TextFieldLabel>
            <TextArea name="prompt_hint" value={video.data.prompt_hint ?? ""} />
          </TextFieldRoot>

          <Button
            onclick={() => {
              transcribe(video.data.playback_id!);
            }}
          >
            Transcribe
          </Button>

          <div class="flex gap-4">
            <Button type="submit" onClick={() => setOpen(false)}>
              Opslaan
            </Button>
          </div>
          <Separator />
          <Button
            variant="destructive"
            class="self-start"
            onclick={deleteVideo}
          >
            Verwijderen
          </Button>
        </form>
        <p>{transcript()}</p>
      </SheetContent>
    </Sheet>
  );
}

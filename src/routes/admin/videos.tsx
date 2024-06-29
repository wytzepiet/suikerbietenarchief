import { Button } from "@/components/ui/button";
import { A } from "@solidjs/router";
import { Plus, Save, Sparkles, Trash2, Upload, VideoIcon } from "lucide-solid";

import { supabase } from "@/libs/services/supabase/client";
import { For, Show, createSignal } from "solid-js";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  TextField,
  TextFieldErrorMessage,
  TextFieldLabel,
  TextFieldRoot,
} from "@/components/ui/textfield";
import { Separator } from "@/components/ui/separator";
import MuxPlayer from "@/components/muxPlayer";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle, { pageTitle } from "@/components/pageTitle";
import { confirmWithDailog } from "@/components/confirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TextArea } from "@/components/ui/textarea";
import { Video, createVideo } from "@/libs/datamodels/video";
import { Image, ImageFallback, ImageRoot } from "@/components/ui/image";
import { toast } from "solid-sonner";
import { Toaster } from "@/components/ui/sonner";
import { TransitionGroup } from "solid-transition-group";
import { searchVideos } from "@/libs/services/algolia";
import { createVideoList } from "@/libs/datamodels/videoList";

const videos = createVideoList();

export default function Videos() {
  videos.fetchVideos();

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
        <TextFieldRoot onChange={videos.search}>
          <TextField placeholder="Zoek video's" />
        </TextFieldRoot>
        <div class="flex flex-col gap-1">
          <For each={videos.videos}>
            {(video) => <VideoListItem video={video} />}
          </For>
          <Show when={videos.loading}>
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton delay={i * 100} class="h-[50px] p-1 box-content" />
            ))}
          </Show>
          <Show when={!videos.loading && !videos.videos.length}>
            <p class="py-4 text-muted-foreground">Geen video's gevonden.</p>
          </Show>
        </div>
      </CardContent>
    </main>
  );
}

function VideoListItem({ video }: { video: Video }) {
  const [open, setOpen] = createSignal(false);

  const canClose = async () => {
    if (!video.hasChanged()) return true;
    return await confirmWithDailog({
      title: "Weet je zeker dat je wilt sluiten?",
      description: "Je hebt nog niet opgeslagen wijzigingen.",
      confirm: "Sluiten",
    });
  };
  const toggleSheet = async (value: boolean) => {
    if (value) {
      setOpen(true);
      video.refetch();
    } else if (await canClose()) {
      setOpen(false);
      video.update({ ...video.data });
    }
  };

  const saveVideo = () => {
    video.saveUpdates();
    const filtered = video.updates.keywords.filter((k) => k !== "!REMOVED!");
    video.update("keywords", filtered);
    setOpen(false);
  };

  async function deleteVideo() {
    const confirmed = await confirmWithDailog(
      {
        title: "Weet je zeker dat je wilt verwijderen?",
        description: "Deze actie kan niet ongedaan worden gemaakt.",
        confirm: "Verwijderen",
      },
      { variant: "destructive" }
    );
    if (!confirmed) return;
    await video.deleteEverywhere();
    videos.fetchVideos();
    setOpen(false);
  }

  function secondsToHms(d: number = 0) {
    const hms = [d / 3600, (d % 3600) / 60, (d % 3600) % 60];
    return hms.map((t) => Math.floor(t).toString().padStart(2, "0")).join(":");
  }

  return (
    <Sheet open={open()} onOpenChange={toggleSheet}>
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
      <SheetContent class="flex flex-col gap-8 overflow-y-scroll pb-0">
        <Toaster class="bottom-[50px]" />

        <SheetHeader>
          <SheetTitle>Bewerk video</SheetTitle>
          <div class="border rounded overflow-hidden shrink-0">
            <MuxPlayer video={video} />
          </div>
        </SheetHeader>

        <TextFieldRoot
          value={video.updates.title ?? ""}
          onChange={(val) => video.update("title", val)}
        >
          <TextFieldLabel>Titel</TextFieldLabel>
          <TextField></TextField>
        </TextFieldRoot>

        <TextFieldRoot
          value={video.updates.description ?? ""}
          onChange={(val) => video.update("description", val)}
        >
          <TextFieldLabel class="flex justify-between items-end">
            Beschrijving
            <Button size="sm" variant="ghost" class="self-start">
              <Sparkles size="1.25em" class="mr-1" /> genereren met AI
            </Button>
          </TextFieldLabel>
          <TextArea autoResize />
        </TextFieldRoot>

        <div class="flex flex-col gap-1">
          <p class="text-sm font-medium">Trefwoorden</p>
          <Keywords video={video} />
        </div>

        <div class="flex gap-4 sticky bottom-0 border-t py-4 bg-background">
          <Button class="flex items-center gap-1" onClick={saveVideo}>
            <Save size="1.25em" />
            Opslaan
          </Button>
          <Separator orientation="vertical" />
          <Button
            variant="outline"
            class="self-start flex items-center gap-1"
            onclick={deleteVideo}
          >
            <Trash2 size="1.25em" /> Verwijderen
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Keywords({ video }: { video: Video }) {
  const [newKeyword, setNewKeyword] = createSignal("");

  const addNewKeyword = () => {
    if (!newKeyword()) return;
    video.update("keywords", video.updates.keywords.length, newKeyword());
    setNewKeyword("");
  };

  return (
    <div class="flex flex-col gap-2">
      <TransitionGroup>
        <For each={Array.from({ length: video.updates.keywords.length })}>
          {(_, i) => {
            const keyword = () => video.updates.keywords[i()];
            const update = (val: string) => video.update("keywords", i(), val);
            const remove = () => {
              const lastValue = keyword();
              toast(keyword(), {
                description: "Trefwoord verwijderd.",
                cancel: {
                  label: "Ongedaan maken",
                  onClick: () => update(lastValue),
                },
              });
              update("!REMOVED!");
            };
            [
              "listen",
              "watch",
              "read",
              "                                                ",
            ];
            return (
              <Show when={keyword() !== "!REMOVED!"}>
                <div class="text-sm flex gap-2 transition-all [&.s-exit-to]:opacity-0">
                  <TextFieldRoot
                    class="grow"
                    value={keyword()}
                    onChange={update}
                    validationState={keyword() ? "valid" : "invalid"}
                  >
                    <TextField />
                    <TextFieldErrorMessage>
                      Vul een waarde in
                    </TextFieldErrorMessage>
                  </TextFieldRoot>
                  <Button variant="outline" size="icon" onClick={remove}>
                    <Trash2 size="1.25em" />
                  </Button>
                </div>
              </Show>
            );
          }}
        </For>

        <div class="text-sm flex gap-2 transition-all">
          <TextFieldRoot
            class="grow"
            value={newKeyword()}
            onChange={setNewKeyword}
            onkeydown={(e: KeyboardEvent) =>
              e.key === "Enter" && addNewKeyword()
            }
          >
            <TextField placeholder="Trefwoord toevoegen..."></TextField>
          </TextFieldRoot>

          <Button variant="secondary" size="icon" onClick={addNewKeyword}>
            <Plus size="1.25em" />
          </Button>
        </div>
      </TransitionGroup>
    </div>
  );
}

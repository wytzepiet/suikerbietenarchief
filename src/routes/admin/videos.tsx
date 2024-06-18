import { Button } from "@/components/ui/button";
import { A, action } from "@solidjs/router";
import { Upload } from "lucide-solid";

import { supabase } from "@/libs/supabase/client";
import { For, createResource, createSignal } from "solid-js";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { Separator } from "@/components/ui/separator";
import { Tables } from "@/libs/supabase/types";
import MuxPlayer from "@/components/muxPlayer";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle, { pageTitle } from "@/components/pageTitle";

import { confirmWithDailog } from "@/components/confirmDialog";
import { SetStoreFunction, createStore } from "solid-js/store";
import { mux } from "@/libs/mux/server";

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
  const [videos] = createResource(async () => {
    const vids = await supabase().from("videos").select().neq("asset_id", null);
    return vids.data?.map((v) => createStore(v));
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
          <For each={videos()}>{(video) => <Video video={video} />}</For>
        </div>
      </CardContent>
    </main>
  );
}

const getMuxData = (id: string) => {
  "use server";
  return mux.video.assets.retrieve(id);
};

type Video = [get: Tables<"videos">, set: SetStoreFunction<Tables<"videos">>];

function Video(props: { video: Video }) {
  const [video, setVideo] = props.video;

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
    const changes = {
      title: String(data.get("title")),
    };

    console.log(video.id);

    const vid = await supabase()
      .from("videos")
      .update(changes)
      .eq("id", video.id)
      .select()
      .single();

    if (vid.data) setVideo(vid.data);

    setOpen(false);
  }, video.id.toString());

  const [muxData] = createResource(() => getMuxData(video.asset_id ?? ""));

  function secondsToHms(d?: number) {
    if (!d) return null;
    const hms = [d / 3600, (d % 3600) / 60, (d % 3600) % 60];
    return hms.map((t) => Math.floor(t).toString().padStart(2, "0")).join(":");
  }

  return (
    <Sheet open={open()} onOpenChange={setSheetOpen}>
      <SheetTrigger class="flex gap-4 items-center p-1 hover:bg-muted rounded-md">
        <img
          class="h-12 aspect-square rounded object-cover"
          src={`https://image.mux.com/${video.playback_id}/thumbnail.webp?height=100`}
          alt={video.title ?? "Video thumbnail"}
        />
        <div class="text-left">
          <p>{video.title ?? "Geen titel"}</p>
          <p class="text-muted-foreground text-sm justify-self-end">
            {secondsToHms(muxData()?.duration)}
          </p>
        </div>
      </SheetTrigger>
      <SheetContent class="flex flex-col gap-4 w-[400px]">
        <SheetHeader>
          <SheetTitle>Bewerk video</SheetTitle>
          <SheetDescription>Video wordt gepubliceerd wanneer de upload klaar is.</SheetDescription>
        </SheetHeader>

        <div class="border rounded overflow-hidden">
          <MuxPlayer playbackId={video.playback_id ?? ""} />
        </div>
        <form class="flex flex-col gap-8" action={saveVideo} method="post">
          <TextFieldRoot>
            <TextFieldLabel>Titel</TextFieldLabel>
            <TextField name="title" value={video.title ?? ""} onInput={handleChange}></TextField>
          </TextFieldRoot>
          <Separator />
          <p class="text-sm text-muted-foreground">
            ChatGPT genereert een beschrijving op basis van de video transcriptie.
          </p>

          <Button class="self-start" type="submit" onClick={() => setOpen(false)}>
            Opslaan
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

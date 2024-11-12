import PageTitle, { pageTitle } from "@/components/pageTitle";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  TextField,
  TextFieldLabel,
  TextFieldRoot,
} from "@/components/ui/textfield";
import { supabase } from "@/libs/services/supabase/client";
import { Tables } from "@/libs/services/supabase/types";
import { MapPin, Plus, Save, Trash2 } from "lucide-solid";
import { Accessor, createEffect, createSignal, For, Suspense } from "solid-js";
import { createResource } from "solid-js";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { confirmWithDailog } from "@/components/confirmDialog";
import { TransitionGroup } from "solid-transition-group";
import { toaster } from "@kobalte/core";
import {
  Toast,
  ToastContent,
  ToastDescription,
  ToastProgress,
  ToastTitle,
} from "@/components/ui/toast";
import { VideoPreview } from "@/components/videoPreview";
import { createVideo } from "@/libs/datamodels/video";
import {
  Combobox,
  ComboboxItem,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
} from "@/components/ui/combobox";

import { createVideoList } from "@/libs/datamodels/videoList";

export default function Locatie() {
  const [locations, { refetch }] = createResource(async () => {
    const { data, error } = await supabase.from("locations").select();
    if (error) throw error;
    return data;
  });

  return (
    <main>
      <PageTitle>Locaties</PageTitle>
      <CardHeader>
        <CardTitle class="text-2xl">{pageTitle()}</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <For each={locations()}>
          {(location) => (
            <LocationItem location={location} onDelete={refetch} />
          )}
        </For>
      </CardContent>
    </main>
  );
}

function LocationItem({
  location,
  onDelete,
}: {
  location: Tables<"locations">;
  onDelete: () => void;
}) {
  const [sheetOpen, setSheetOpen] = createSignal(false);

  const updatedLocation = { ...location };

  const [updatedVideos, setUpdatedVideos] = createSignal<Tables<"videos">[]>(
    []
  );

  let videos: Tables<"videos">[] = [];

  supabase
    .from("locations_videos")
    .select()
    .eq("location_id", location.id)
    .then(async (locations) => {
      if (locations.error) return;
      const { data, error } = await supabase
        .from("videos")
        .select()
        .in(
          "id",
          locations.data.map((v) => v.video_id)
        );

      if (error) throw error;
      videos = [...data];
      setUpdatedVideos(data);
      return videos;
    });

  const toggleSheet = async () => {
    if (!sheetOpen()) return setSheetOpen(true);

    const locationHasChanged =
      JSON.stringify(updatedLocation) !== JSON.stringify(location);
    const videosHaveChanged =
      JSON.stringify(updatedVideos()) !== JSON.stringify(videos);

    if (locationHasChanged || videosHaveChanged) {
      const closeConfirmed = await confirmWithDailog(
        {
          title: "Weet je zeker dat je wilt sluiten?",
          description: "Je hebt nog niet opgeslagen wijzigingen.",
          confirm: "Sluiten",
        },
        { variant: "default" }
      );
      if (closeConfirmed) return setSheetOpen(false);
    }
    setSheetOpen(false);
  };

  const mapElement = (
    <div
      class="relative w-full aspect-[3/2] shrink-0"
      style="clip-path: inset(0 0 0 0 round 10px)"
    ></div>
  ) as HTMLDivElement;

  createEffect(async () => {
    if (!sheetOpen()) return;

    const { Loader } = await import("@googlemaps/js-api-loader");
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: "beta",
      libraries: ["maps", "marker"],
    });

    const { Map } = await loader.importLibrary("maps");
    const { AdvancedMarkerElement } = await loader.importLibrary("marker");

    const map = new Map(mapElement, {
      mapId: "5e7fdffd91c64a70",
      center: location,
      zoom: 8,
      backgroundColor: "transparent",
      disableDefaultUI: true,
      gestureHandling: "greedy",
    });

    const marker = new AdvancedMarkerElement({
      map,
      position: location,
      title: location.name,
      gmpDraggable: true,
    });

    marker.addListener("dragend", () => {
      if (!marker.position || !sheetOpen()) return;
      const { lat, lng } = marker.position;
      if (typeof lat !== "number" || typeof lng !== "number") return;
      updatedLocation.lat = lat;
      updatedLocation.lng = lng;
    });
  });

  const save = () => {
    const locationHasChanged =
      JSON.stringify(updatedLocation) !== JSON.stringify(location);
    if (locationHasChanged) {
      supabase.from("locations").update(updatedLocation).eq("id", location.id);
    }

    updatedVideos().forEach(async ({ id }) => {
      if (videos.find((v) => v.id === id)) {
        return;
      }
      const { error } = await supabase.from("locations_videos").insert({
        location_id: location.id,
        video_id: id,
      });
      if (error) console.error(error.message);
      console.log("added video", location.id, id);
    });
    videos.forEach(async ({ id }) => {
      if (updatedVideos().find((v) => v.id === id)) return;
      const { error } = await supabase
        .from("locations_videos")
        .delete()
        .eq("location_id", location.id)
        .eq("video_id", id);
      if (error) console.error(error.message);
      console.log("removed video", location.id, id);
    });

    setSheetOpen(false);
    toaster.show(({ toastId }) => (
      <Toast toastId={toastId}>
        <ToastContent>
          <ToastTitle>Locatie opgeslagen</ToastTitle>
        </ToastContent>
      </Toast>
    ));
  };

  const deleteLocation = async () => {
    const deleteConfirmed = await confirmWithDailog(
      {
        title: "Weet je zeker dat je wilt verwijderen?",
        description: "Je kunt deze locatie niet meer terugvinden.",
        confirm: "Verwijder",
      },
      { variant: "destructive" }
    );
    if (!deleteConfirmed) return;
    const result = await supabase
      .from("locations")
      .delete()
      .eq("id", location.id);
    if (result.error) console.error(result.error.message);
    setSheetOpen(false);
    onDelete();
  };

  return (
    <Sheet open={sheetOpen()} onOpenChange={toggleSheet} forceMount={false}>
      <SheetTrigger class="flex gap-4 items-center">
        <MapPin size="1.5em" />
        <div class="text-left">
          <p>{location.name}</p>
          <p class="text-sm text-muted-foreground">
            {location.lat}, {location.lng}
          </p>
        </div>
      </SheetTrigger>
      <SheetContent class="flex flex-col">
        <div class="flex flex-col gap-6 p-1 overflow-y-scroll grow">
          <SheetTitle>{location.name}</SheetTitle>

          {mapElement}

          <TextFieldRoot name="name" value={location.name}>
            <TextFieldLabel>Naam</TextFieldLabel>
            <TextField></TextField>
          </TextFieldRoot>

          <TextFieldRoot name="name" value={location.description ?? ""}>
            <TextFieldLabel>Beschrijving</TextFieldLabel>
            <TextArea autoResize class="h-44"></TextArea>
          </TextFieldRoot>
          <Suspense fallback={<div>Loading...</div>}>
            <Separator />
            <h2 class="text-lg font-medium">Videos over deze locatie</h2>
            <Videos
              videos={updatedVideos}
              onAdd={(video) => {
                if (updatedVideos().find((v) => v.id === video.id)) return;
                setUpdatedVideos((videos) => [...videos, video]);
              }}
              onRemove={({ id }) => {
                setUpdatedVideos((videos) => videos.filter((v) => v.id !== id));
              }}
            />
          </Suspense>
        </div>
        <div class="flex gap-4">
          <Button class="flex gap-2" onClick={save}>
            <Save size="1.25em" /> Opslaan
          </Button>
          <Separator orientation="vertical" />
          <Button variant="outline" class="flex gap-2" onClick={deleteLocation}>
            <Trash2 size="1.25em" /> Verwijderen
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Videos({
  videos,
  onAdd,
  onRemove,
}: {
  videos: Accessor<Tables<"videos">[]>;
  onAdd: (video: Tables<"videos">) => void;
  onRemove: (video: Tables<"videos">) => void;
}) {
  const videoOptions = createVideoList();
  videoOptions.fetchVideos({ limit: 10 });

  const onInputChange = (value: string) => {
    videoOptions.search(value);
  };

  const [comboboxValue, setComboboxValue] = createSignal("");

  return (
    <div class="flex flex-col gap-2">
      <TransitionGroup>
        <For each={videos()}>
          {(videoData) => {
            const video = createVideo(videoData);
            const remove = () => {
              onRemove(video.data);
              toaster.show(({ toastId }) => (
                <Toast toastId={toastId}>
                  <ToastContent>
                    <div class="flex justify-between">
                      <div>
                        <ToastTitle>{video.data.title}</ToastTitle>
                        <ToastDescription class="text-muted-foreground">
                          Video verwijderd van locatie.
                        </ToastDescription>
                      </div>
                    </div>
                  </ToastContent>
                  <ToastProgress />
                </Toast>
              ));
            };

            return (
              <div class="text-sm flex items-center gap-2 transition-all [&.s-exit-to]:opacity-0">
                <VideoPreview
                  video={video}
                  showText={false}
                  class="aspect-square h-20 pb-0"
                />
                <div class="grow">
                  <h2 class="text-lg font-medium line-clamp-1 overflow-ellipsis">
                    {video.data.title}
                  </h2>
                  <p class="text-muted-foreground text-sm line-clamp-1 overflow-ellipsis">
                    {video.data.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={remove}
                  class="shrink-0"
                >
                  <Trash2 size="1.25em" />
                </Button>
              </div>
            );
          }}
        </For>

        <div class="text-sm flex gap-2 transition-all">
          <Combobox
            options={videoOptions.videos.map((v) => v.data.title)}
            onInputChange={onInputChange}
            value={comboboxValue()}
            onChange={(val) => {
              setComboboxValue(val ?? "");
              const video = videoOptions.videos.find(
                (v) => v.data.title === val
              );
              if (!video) return;
              onAdd(video.data);
              setComboboxValue("");
            }}
            itemComponent={({ item }) => {
              const video = videoOptions.videos.find(
                (v) => v.data.title == item.rawValue
              );
              if (!video) return;
              return (
                <div class="text-sm flex items-center gap-2 max-w-md">
                  <VideoPreview
                    video={video}
                    showText={false}
                    class="aspect-square h-16 pb-0"
                  />
                  <ComboboxItem item={item}>
                    <h2 class="text-lg font-medium line-clamp-1 overflow-ellipsis">
                      {video.data.title}
                    </h2>
                    <p class="text-muted-foreground text-sm line-clamp-1 overflow-ellipsis">
                      {video.data.description}
                    </p>
                  </ComboboxItem>
                </div>
              );
            }}
          >
            <ComboboxTrigger class="w-full">
              <ComboboxInput />
            </ComboboxTrigger>
            <ComboboxContent class="p-1" listClass="flex flex-col gap-2" />
          </Combobox>
        </div>
      </TransitionGroup>
    </div>
  );
}

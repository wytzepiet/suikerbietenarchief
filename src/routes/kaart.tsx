import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { VideoPreview } from "@/components/videoPreview";
import { createVideo, Video } from "@/libs/datamodels/video";
import { supabase } from "@/libs/services/supabase/client";
import { Tables } from "@/libs/services/supabase/types";
import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  onCleanup,
  onMount,
} from "solid-js";
import { Spinner, SpinnerType } from "solid-spinner";

export default function Kaart() {
  onMount(() => {
    document.body.style.overflow = "hidden";
    onCleanup(() => (document.body.style.overflow = "auto"));
  });

  const [locations] = createResource(async () => {
    const { data, error } = await supabase.from("locations").select();
    if (error) throw error;
    return data;
  });

  const [currentLocation, setCurrentLocation] =
    createSignal<Tables<"locations">>();
  const [open, setOpen] = createSignal(false);

  const [videos, setVideos] = createSignal<Video[]>([]);
  createEffect(async () => {
    const location = currentLocation();
    if (!location) return [];

    const { data, error } = await supabase
      .from("locations_videos")
      .select()
      .eq("location_id", location.id)
      .then(async (locations) => {
        return await supabase
          .from("videos")
          .select()
          .in("id", locations.data?.map((v) => v.video_id) ?? []);
      });

    if (error) throw error;
    setVideos(data.map(createVideo));
  });

  const marker = (location: Tables<"locations">) => (
    <div>
      <Button
        class="p-2"
        variant="outline"
        onclick={() => {
          setCurrentLocation(location);
          setOpen(true);
        }}
      >
        <h2 class="text-lg">{location.name}</h2>
      </Button>
    </div>
  );
  const markers = createMemo(() => locations()?.map(marker) ?? []);

  const mapElement = (
    <div class="!fixed inset-0 h-screen w-screen z-0"></div>
  ) as HTMLDivElement;

  onMount(async () => {
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
      center: { lat: 52.168686, lng: 5.535475 },
      zoom: 8,
      backgroundColor: "transparent",
      disableDefaultUI: true,
      gestureHandling: "greedy",
    });

    createEffect(() => {
      locations()?.forEach(({ name, lat, lng }, i) => {
        const content = markers()[i]! as Node;
        if (!content) return;
        setTimeout(() => {
          new AdvancedMarkerElement({
            map,
            position: { lat, lng },
            title: name,
            content,
            gmpClickable: true,
          });
        }, 10);
      });
    });

    console.log(loader.status);
  });

  return (
    <main>
      <div class="h-screen w-full flex items-center justify-center">
        <Spinner type={SpinnerType.oval} />
      </div>
      <div class="opacity-0"> {markers()}</div>
      {mapElement}
      <Sheet open={open()} onOpenChange={setOpen}>
        <SheetContent class="flex flex-col gap-4 overflow-y-scroll overflow-x-hidden">
          <SheetTitle class="text-5xl">{currentLocation()?.name}</SheetTitle>
          <SheetDescription>{currentLocation()?.description}</SheetDescription>

          <h3 class="text-2xl pt-4">
            Video's waar {currentLocation()?.name} in voorkomt
          </h3>
          <For each={videos()}>
            {(video) => {
              return <VideoPreview video={video} />;
            }}
          </For>
        </SheetContent>
      </Sheet>
    </main>
  );
}

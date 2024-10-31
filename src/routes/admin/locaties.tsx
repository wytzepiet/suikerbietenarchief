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
import { action } from "@solidjs/router";
import { MapPin, Save, Trash2 } from "lucide-solid";
import { createSignal, For, onMount } from "solid-js";
import { createResource } from "solid-js";
import { z } from "zod";
import { zfd } from "zod-form-data";
import LocationPicker from "location-picker";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const schema = zfd.formData({
  id: zfd.numeric(),
  name: zfd.numeric(),
  lat: zfd.numeric(),
  lng: zfd.numeric(),
});

export default function Locatie() {
  const [locations] = createResource(async () => {
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
          {(location) => <LocationItem location={location} />}
        </For>
      </CardContent>
    </main>
  );
}

function LocationItem({ location }: { location: Tables<"locations"> }) {
  const pickerId = `picker-${location.id}`;

  const [marker, setMarker] = createSignal();

  const mapElement = (
    <div
      class="relative w-full aspect-[3/2] shrink-0"
      style="clip-path: inset(0 0 0 0 round 10px)"
    ></div>
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
      const location = marker.position;
      setMarker(location);
    });
  });
  return (
    <Sheet>
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
        <div class="flex flex-col gap-2 p-1 overflow-y-scroll grow">
          <SheetTitle>{location.name}</SheetTitle>

          {mapElement}

          <TextFieldRoot name="name" value={location.name}>
            <TextFieldLabel>Naam</TextFieldLabel>
            <TextField></TextField>
          </TextFieldRoot>

          <TextFieldRoot name="name" value={location.description ?? ""}>
            <TextFieldLabel>Beschrijving</TextFieldLabel>
            <TextArea class="h-44"></TextArea>
          </TextFieldRoot>
        </div>
        <div class="flex gap-4">
          <Button class="flex gap-2">
            <Save size="1.25em" /> Opslaan
          </Button>
          <Separator orientation="vertical" />
          <Button variant="outline" class="flex gap-2">
            <Trash2 size="1.25em" /> Verwijderen
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

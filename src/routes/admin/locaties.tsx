import PageTitle, { pageTitle } from "@/components/pageTitle";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/libs/services/supabase/client";
import { MapPin } from "lucide-solid";
import { For } from "solid-js";
import { createResource } from "solid-js";

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
          {(location) => (
            <div class="flex gap-4 items-center">
              <MapPin size="1.5em" />
              <div>
                <p>{location.name}</p>
                <p class="text-sm text-muted-foreground">
                  {location.lat}, {location.lng}
                </p>
                <p></p>
              </div>
            </div>
          )}
        </For>
      </CardContent>
    </main>
  );
}

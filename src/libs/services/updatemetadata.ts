import { latLngFromPlace } from "@/libs/services/googlemaps";
import {
  generateLocationDescription,
  generateMetadata,
} from "@/libs/services/openai";
import { supabase } from "@/libs/services/supabase/server";

export async function updateMetadata(
  id: number,
  params: { title: string; prompt_hint: string; transcript: string }
) {
  "use server";
  const { title, prompt_hint, transcript } = params;

  if (!title || !transcript) throw new Error("Missing title or transcript");

  const rawMetadata = await generateMetadata(title, prompt_hint, transcript);
  if (!rawMetadata) throw new Error("Failed to generate metadata");

  const locationPromises = rawMetadata.locations.map(async (name) => {
    const latLng = await latLngFromPlace(name);
    if (!latLng) return console.error("Couldn't get lat/lng for", name);

    const table = supabase().from("locations");
    const existing = await table.select().eq("name", name);
    if (existing.data?.length) return existing.data[0].id;

    const { description } = await generateLocationDescription(name);

    const { data, error } = await table
      .insert({ name, ...latLng, description })
      .select();
    if (error) return console.error("Error inserting location:", error);
    return data[0].id;
  });
  const unfilteredLocations = await Promise.all(locationPromises);
  const locations = unfilteredLocations.filter((loc) => loc !== undefined);

  const { keywords, description } = rawMetadata;
  const metadata = { keywords, description, locations };

  const videos = supabase().from("videos");
  const { data, error } = await videos.update(metadata).eq("id", id).select();

  if (error) throw new Error("Error updating video metadata: " + error.message);

  console.log("metadata:", metadata);
  return data[0];
}
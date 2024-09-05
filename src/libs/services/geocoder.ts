import { Client } from "@googlemaps/google-maps-services-js";

export async function latLngFromPlace(place: string) {
  "use server";
  const client = new Client();
  try {
    const res = await client.geocode({
      params: {
        key: process.env.MAPS_API_KEY!,
        address: place,
      },
    });
    return res.data.results[0].geometry.location;
  } catch (e: any) {
    console.error("latLngFromPlace error:", e);
  }
}

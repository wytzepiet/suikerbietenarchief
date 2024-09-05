import { Client } from "@googlemaps/google-maps-services-js";

export async function latLngFromPlace(place: string) {
  "use server";
  const client = new Client();

  console.log("place:", place);
  try {
    const res = await client.geocode({
      params: {
        key: process.env.VITE_GOOGLE_MAPS_API_KEY!,
        address: place,
      },
    });
    if (res.status !== 200) {
      console.error("latLngFromPlace error:", res.data.error_message);
      return;
    }
    return res.data.results[0].geometry.location;
  } catch (e: any) {
    console.error("latLngFromPlace error:", e);
  }
}

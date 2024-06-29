"use server";

import algoliasearch from "algoliasearch";
import { Tables } from "./supabase/types";

const client = algoliasearch("YS563K0XVY", process.env.ALGOLIA_API_KEY!);
const videos = () => client.initIndex("videos");

export function saveAlgoliaVideo(video: Tables<"videos">) {
  videos().saveObject({
    objectID: video.id,
    title: video.title,
    description: video.description,
    keywords: video.keywords,
  });
}

export async function searchVideos(query: string) {
  const res = await videos().search(query, {
    attributesToRetrieve: ["objectID"],
  });
  return res;
}

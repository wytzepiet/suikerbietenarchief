import { createStore } from "solid-js/store";
import { Video, createVideo } from "./video";
import { createSignal } from "solid-js";
import { supabase } from "../services/supabase/client";
import { searchVideos } from "../services/algolia";

const ref = () => supabase.from("videos");

export function createVideoList() {
  const [videos, setVideos] = createStore<Video[]>([]);
  const [loading, setLoading] = createSignal(true);

  const fetchVideos = async (ids?: number[]) => {
    const filterBuilder = ref().select().neq("asset_id", null);
    if (ids) filterBuilder.in("id", ids);

    const { data, error } = await filterBuilder;
    setLoading(false);
    if (error) return console.error(error);
    setVideos(data.map(createVideo));
  };

  let searchTimeout: number;
  async function search(query: string) {
    const performSearch = async () => {
      const res = await searchVideos(query);
      const hits = res.hits.map((hit) => parseInt(hit.objectID));
      fetchVideos(hits);
    };
    if (searchTimeout) window.clearTimeout(searchTimeout);
    searchTimeout = window.setTimeout(performSearch, 200);
  }

  return {
    videos,
    loading,
    fetchVideos,
    search,
  };
}

import { createStore } from "solid-js/store";
import { Video, createVideo } from "./video";
import { createSignal } from "solid-js";
import { supabase } from "../services/supabase/client";
import { searchVideos } from "../services/algolia";

const ref = () => supabase.from("videos");

export function createVideoList() {
  const [videos, setVideos] = createStore<Video[]>([]);
  const [loading, setLoading] = createSignal(true);

  type FetchProps = { limit?: number; ids?: number[] };
  let current: FetchProps = {};

  const fetchVideos = async (props: FetchProps = {}) => {
    props.limit ??= 9;
    current = props;
    const lim = props.limit!;
    const filterBuilder = ref().select().limit(lim).neq("asset_id", null);
    if (props.ids) filterBuilder.in("id", props.ids);

    const { data, error } = await filterBuilder;
    setLoading(false);
    if (error) return console.error(error);
    setVideos(data.map(createVideo));
  };

  const fetchMore = async () => {
    current.limit = (current.limit ?? 0) + 9;
    await fetchVideos(current);
  };

  let searchTimeout: number;
  async function search(query: string) {
    const performSearch = async () => {
      const res = await searchVideos(query);
      const hits = res.hits.map((hit) => parseInt(hit.objectID));
      fetchVideos({ ids: hits });
    };
    if (searchTimeout) window.clearTimeout(searchTimeout);
    searchTimeout = window.setTimeout(performSearch, 200);
  }

  return {
    videos,
    loading,
    fetchVideos,
    fetchMore,
    search,
  };
}

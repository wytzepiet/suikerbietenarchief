import { createStore } from "solid-js/store";
import { Tables } from "../services/supabase/types";
import { supabase } from "../services/supabase/client";
import { PostgrestResponse } from "@supabase/supabase-js";
import { saveAlgoliaVideo } from "../services/algolia";
// import { deleteTranscript } from "../services/assemblyai";
import { deleteMuxVideo as deleteMuxVideo, getMuxInfo } from "../services/mux";
import { toast } from "solid-sonner";
import { Asset } from "@mux/mux-node/resources/video/assets.mjs";
import { createSignal, on } from "solid-js";
import { cache } from "@solidjs/router";

type Data = Tables<"videos">;
const ref = () => supabase.from("videos");

export type Video = ReturnType<typeof createVideo>;

export function createVideo(input: Data) {
  const [data, setData] = createStore<Data>({ ...input });
  const [updates, update] = createStore<Data>({ ...input });

  const hasChanged = () => JSON.stringify(data) !== JSON.stringify(updates);

  function handleResponse(res: PostgrestResponse<Data>) {
    if (res.error) return console.error(res.error);
    if (res.data) setData(res.data[0]);
    return res.data[0];
  }

  const refetch = () => ref().select().eq("id", data.id).then(handleResponse);

  const saveUpdates = async () => {
    toast.loading("Opslaan...", { id: "saveVideo" });
    const res = await ref().upsert(updates).select().then(handleResponse);
    if (res) saveAlgoliaVideo(res);
    toast.success("Video opgeslagen.", { id: "saveVideo" });
  };

  async function deleteEverywhere() {
    await ref().delete().eq("id", data.id);
    if (data.asset_id) deleteMuxVideo(data.asset_id);
    if (data.transcript_id) deleteTranscript(data.transcript_id);
    toast("Video verwijderd.", { closeButton: true });
  }

  function thumbnailUrl(
    params: {
      width?: number;
      height?: number;
      type?: "thumbnail" | "animated";
    } = {}
  ) {
    if (!params.type) params.type = "thumbnail";
    const url = new URL(
      `https://image.mux.com/${data.playback_id}/${params.type}.webp`
    );
    if (params?.width) url.searchParams.set("width", String(params.width));
    if (params?.height) url.searchParams.set("height", String(params.height));

    return url.toString();
  }

  const [_muxInfo, setMuxInfo] = createSignal<Asset | null>(null);
  const muxInfo = () => {
    if (!_muxInfo() && data.asset_id) {
      cache(() => getMuxInfo(data.asset_id!), data.asset_id)().then(setMuxInfo);
    }
    return _muxInfo();
  };

  return {
    data,
    setData,
    updates,
    update,
    hasChanged,
    saveUpdates,
    deleteEverywhere,
    refetch,
    thumbnailUrl,
    muxInfo,
  };
}

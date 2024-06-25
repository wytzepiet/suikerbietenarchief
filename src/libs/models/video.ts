import { createStore } from "solid-js/store";
import { Tables } from "../services/supabase/types";
import { supabase } from "../services/supabase/client";
import { deleteMuxVideo } from "../services/mux";
import { PostgrestResponse } from "@supabase/supabase-js";
import { deleteTranscript } from "../services/assemblyai";

type Data = Tables<"videos">;
const ref = supabase.from("videos");

export type Video = ReturnType<typeof createVideo>;

export function createVideo(input: Data) {
  const [data, setData] = createStore<Data>(input);
  const [updates, update] = createStore<Partial<Data>>({ id: input.id });

  function saveResponse(res: PostgrestResponse<Data>) {
    if (res.error) console.error(res.error);
    if (res.data) setData(res.data[0]);
  }

  const refetch = () => ref.select().eq("id", data.id).then(saveResponse);
  const save = () => ref.upsert(updates).select().then(saveResponse);

  const onDelete: (() => void)[] = [];
  async function deleteEverywhere() {
    if (data.asset_id) deleteMuxVideo(data.asset_id);
    if (data.transcript_id) deleteTranscript(data.transcript_id);
    await ref.delete().eq("id", data.id);
    onDelete.forEach((fn) => fn());
  }

  function thumbnailUrl(
    params: { width?: number; height?: number },
    type: "thumbnail" | "animated" = "thumbnail"
  ) {
    const url = new URL(
      `https://image.mux.com/${data.playback_id}/${type}.webp`
    );
    if (params.width) url.searchParams.set("width", String(params.width));
    if (params.height) url.searchParams.set("height", String(params.height));

    return url.toString();
  }

  function addKeyword(value: string) {
    if (!data.keywords) return;
    data.keywords.push(value);
    setData("keywords", data.keywords);
  }

  return {
    data,
    updates,
    update,
    save,
    refetch,
    onDelete,
    deleteEverywhere,
    thumbnailUrl,
    addKeyword,
  };
}

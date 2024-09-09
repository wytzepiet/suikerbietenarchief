import { createStore } from "solid-js/store";
import { Tables } from "../services/supabase/types";
import { supabase } from "../services/supabase/client";
import { PostgrestResponse } from "@supabase/supabase-js";
import { saveAlgoliaVideo } from "../services/algolia";
import { deleteTranscript } from "../services/assemblyai";
import { deleteMuxVideo as deleteMuxVideo, getMuxInfo } from "../services/mux";
import { toaster } from "@kobalte/core";
import {
  Toast,
  ToastContent,
  ToastProgress,
  ToastTitle,
} from "@/components/ui/toast";

import { Asset } from "@mux/mux-node/resources/video/assets.mjs";
import { createSignal } from "solid-js";
import { cache } from "@solidjs/router";
import { Check, Loader } from "lucide-solid";

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
    const [saved, setSaved] = createSignal(false);
    toaster.show((props) => (
      <Toast toastId={props.toastId}>
        <ToastContent>
          <div class="flex items-center gap-2 text-sm">
            {saved() ? <Check /> : <Loader class="animate-spin" />}
            <ToastTitle>
              {saved() ? "Video opgeslagen." : "Opslaan..."}
            </ToastTitle>
          </div>
        </ToastContent>
        <ToastProgress />
      </Toast>
    ));

    const res = await ref().upsert(updates).select().then(handleResponse);
    if (res) saveAlgoliaVideo(res);

    setSaved(true);
  };

  async function deleteEverywhere() {
    await ref().delete().eq("id", data.id);
    if (data.asset_id) deleteMuxVideo(data.asset_id);
    if (data.transcript_id) deleteTranscript(data.transcript_id);
    toaster.show((props) => (
      <Toast toastId={props.toastId}>
        <ToastContent>
          <ToastTitle>Video is verwijderd.</ToastTitle>
        </ToastContent>
        <ToastProgress />
      </Toast>
    ));
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

import { createSignal, createUniqueId, on, onCleanup } from "solid-js";
import { supabase } from "../services/supabase/client";
import { Upload as MuxUpload } from "@mux/mux-node/resources/video/uploads.mjs";
import { UpChunk } from "@mux/upchunk";
import { SetStoreFunction, createStore } from "solid-js/store";
import { Tables } from "../services/supabase/types";
import { PostgrestResponse } from "@supabase/supabase-js";
import { createMuxUpload } from "../services/mux";

export type Status = "idle" | "uploading" | "done" | "error" | "cancelled";
// export type Upload = ReturnType<typeof createUpload>;

const ref = supabase.from("uploads");

const defaultState = {
  error: "",
  progress: 0,
  status: "idle" as Status,
};

export type Upload = ReturnType<typeof createUpload>;

type Data = Tables<"uploads">;

export function createUpload(file: File) {
  const [state, setState] = createStore({ ...defaultState });
  const [data, setData] = createStore<Partial<Tables<"uploads">>>({
    generate_description: true,
    title: file.name,
  });

  const onCancel: (() => void)[] = [];
  const cancel = () => onCancel.forEach((fn) => fn());

  async function start() {
    if (state.status !== "idle") return;

    const muxUpload = await createMuxUpload();
    const upChunk = UpChunk.createUpload({
      endpoint: muxUpload.url,
      file: file,
      chunkSize: 5120, // Uploads the file in ~5mb chunks
    });
    upChunk.on("error", (err) => setState("error", err.detail));
    upChunk.on("progress", (prog) => setState("progress", prog.detail));
    upChunk.on("success", () => setState("status", "done"));
    onCancel.unshift(() => upChunk.abort());

    setData("upload_id", muxUpload.id);
    onCancel.unshift(async () => {
      ref.delete().eq("upload_id", muxUpload.id).select();
    });

    setState("status", "uploading");

    saveToDatabase();
  }

  function handleRepsonse(res: PostgrestResponse<Data>) {
    if (res.error) {
      console.error(res.error);
      setState("error", res.error.message);
    }
    if (res.data) setData(res.data[0]);
    return res;
  }

  async function saveToDatabase() {
    console.log("saving upload", data);
    ref.upsert(data).select().then(handleRepsonse);
  }

  return {
    file,
    state,
    data,
    setData,
    start,
    onCancel,
    cancel,
    saveToDatabase,
    uid: createUniqueId(),
  };
}

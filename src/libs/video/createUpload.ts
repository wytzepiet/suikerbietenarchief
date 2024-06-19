import { createSignal, onCleanup } from "solid-js";
import { supabase } from "../supabase/client";
import { Upload as MuxUpload } from "@mux/mux-node/resources/video/uploads.mjs";
import { UpChunk } from "@mux/upchunk";
import { createStore } from "solid-js/store";
import { Tables } from "../supabase/types";

export type Status = "idle" | "uploading" | "done" | "error" | "cancelled";
export type Upload = ReturnType<typeof createUpload>;


export function createUpload(file: File) {

    const [state, setState] = createStore({
      error: "",
      progress: 0,
      status: "idle" as Status,
    });
    const [data, setData ] = createStore<Partial<Tables<'uploads'>>>({
      title: file.name
    });

      /** A list of functions to call when the upload is removed */
      const onCancel: (() => void)[] = [];
     
      const cancel = () => onCancel.forEach((fn) => fn());


    async function start() {
      if (state.progress) return;
  
      const token = (await supabase().auth.getSession()).data.session
        ?.access_token;
  
      fetch(`/api/video/getmuxuploadurl?token=${token}`).then(async (r) => {
        const {data, error} = (await r.json()) as {
          error?: string;
          data?: MuxUpload;
        };
  
        if (error) return setState("error", error);
        if (!data?.url) return setState("error", "No upload URL");
  
        const upChunk = UpChunk.createUpload({
          endpoint: data.url,
          file: file,
          chunkSize: 5120, // Uploads the file in ~5mb chunks
        });
        upChunk.on("error", (err) => setState("error", err.detail));
        upChunk.on("progress", (prog) => setState("progress", prog.detail));
        upChunk.on("success", () => setState("status", "done"));
        onCancel.unshift(() => upChunk.abort());
  
      upload.setData('upload_id', data.id);
       onCancel.unshift(async () => {
          const uploads = supabase().from("uploads");
           uploads.delete().eq("upload_id", data!.id).select();
        });
  
        if (state.status !== "uploading") setState('status',"uploading");
  
        save();
      });
    }

    async function save() {


      if (upload.data.id) {
        const { error } = await supabase()
          .from("uploads")
          .upsert( upload.data);
        if (error) return setState("error", error.message);
      } else {
        const { data, error } = await supabase()
          .from("uploads")
          .insert(upload.data)
          .select("id");
        if (error) return setState('error', error.message);
        upload.data.id = data[0].id;
      }
    }

  const upload = { 
    file, 
    data, 
    setData, 
    state, 
    setState,
    start, 
    cancel, 
    onCancel, 
    save, 
   
  };

  return upload;
}

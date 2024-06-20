import { createSignal, onCleanup } from "solid-js";
import { supabase } from "../supabase/client";
import { Upload as MuxUpload } from "@mux/mux-node/resources/video/uploads.mjs";
import { UpChunk } from "@mux/upchunk";
import { createStore } from "solid-js/store";
import { Tables } from "../supabase/types";

export type Status = "idle" | "uploading" | "done" | "error" | "cancelled";
// export type Upload = ReturnType<typeof createUpload>;


const defaultState = {
  error: "",
  progress: 0,
  status: "idle" as Status,
};

export class Upload {
  file: File;

  private stateStore = createStore(defaultState);
  state = this.stateStore[0];
  setState = this.stateStore[1];

  private dataStore = createStore<Partial<Tables<'uploads'>>>({
    generate_description: true,
  });
  data = this.dataStore[0];
  setData = this.dataStore[1];

  onCancel: (() => void)[] = [];
  cancel = () => this.onCancel.forEach((fn) => fn());

  constructor(file: File) {
    this.file = file;
    this.setData('title', file.name);
  }

  async  start() {
    if (this.state.progress) return;

    const token = (await supabase().auth.getSession()).data.session
      ?.access_token;

    fetch(`/api/video/getmuxuploadurl?token=${token}`).then(async (r) => {
      const {data, error} = (await r.json()) as {
        error?: string;
        data?: MuxUpload;
      };

      if (error) return this.setState("error", error);
      if (!data?.url) return this.setState("error", "No upload URL");

      const upChunk = UpChunk.createUpload({
        endpoint: data.url,
        file: this.file,
        chunkSize: 5120, // Uploads the file in ~5mb chunks
      });
      upChunk.on("error", (err) => this.setState("error", err.detail));
      upChunk.on("progress", (prog) => this.setState("progress", prog.detail));
      upChunk.on("success", () => this.setState("status", "done"));
      this.onCancel.unshift(() => upChunk.abort());

    this.setData('upload_id', data.id);
     this.onCancel.unshift(async () => {
        const uploads = supabase().from("uploads");
         uploads.delete().eq("upload_id", data!.id).select();
      });

      if (this.state.status !== "uploading") this.setState('status',"uploading");

      this.save();
    });
  }

  async save() {
    if (this.data.id) {
      const { error } = await supabase()
        .from("uploads")
        .upsert( this.data);
      if (error) return this.setState("error", error.message);
    } else {
      const { data, error } = await supabase()
        .from("uploads")
        .insert(this.data)
        .select("id");
      if (error) return this.setState('error', error.message);
      this.data.id = data[0].id;
    }
  }
}
import { createSignal, onCleanup } from "solid-js";
import { supabase } from "../supabase/client";
import { Upload as MuxUpload } from "@mux/mux-node/resources/video/uploads.mjs";
import { UpChunk } from "@mux/upchunk";
import { user } from "../supabase/user";

export type Status = "idle" | "uploading" | "done";
export type Upload = ReturnType<typeof createUpload>;

export function createUpload(file: File) {
  const [error, setError] = createSignal("");
  const [progress, setProgress] = createSignal(0);
  const [status, setStatus] = createSignal<Status>("idle");

  /** A list of functions to call when the upload is removed */
  const onRemove: (() => void)[] = [];

  /** Cancel and remove the upload */
  const remove = () => onRemove.forEach((fn) => fn());

  const [title, setTitle] = createSignal(file.name);
  // Whether to generate a description from the video using ChatGPT
  const [generateDescription, setGenerateDescription] = createSignal(true);

  let recordId = 0;
  /** Save the video to the database */
  async function save() {
    const record = () => ({
      title: video.title(),
      generate_description: video.generateDescription(),
      description: video.description,
      prompt_hint: video.hint,
      upload_id: video.uploadId,
      user_id: user()?.id,
    });

    if (recordId) {
      const { error } = await supabase()
        .from("uploads")
        .upsert({
          id: recordId,
          ...record(),
        });
      if (error) return setError(error.message);
    } else {
      const { data, error } = await supabase()
        .from("uploads")
        .insert(record())
        .select("id");
      if (error) return setError(error.message);
      recordId = data[0].id;
    }
  }

  /** start the upload process */
  async function start() {
    if (progress()) return;

    const token = (await supabase().auth.getSession()).data.session
      ?.access_token;

    fetch(`/api/mux/getuploadurl?token=${token}`).then(async (res) => {
      const { error, data } = (await res.json()) as {
        error?: string;
        data?: MuxUpload;
      };

      if (error) return setError(error);
      if (!data?.url) return setError("No upload URL");

      const upChunk = UpChunk.createUpload({
        endpoint: data.url,
        file: file,
        chunkSize: 5120, // Uploads the file in ~5mb chunks
      });
      upChunk.on("error", (err) => setError(err.detail));
      upChunk.on("progress", (prog) => setProgress(prog.detail));
      upChunk.on("success", () => setStatus("done"));
      onRemove.push(() => upChunk.abort());

      video.uploadId = data.id;
      onRemove.push(async () => {
        const uploads = supabase().from("uploads");
        const res = await uploads.delete().eq("upload_id", data.id).select();
        console.log(user()?.id);
        console.log(data.id);
        console.log(res);
      });

      if (status() !== "uploading") setStatus("uploading");

      save();
    });
  }

  const video = {
    title,
    setTitle,
    generateDescription,
    setGenerateDescription,
    hint: "",
    description: "",
    save,
    uploadId: "",
  };

  const upload = {
    file,
    video,
    start,
    remove,
    onRemove,
    error,
    setError,
    progress,
    setProgress,
    status,
    setStatus,
  };

  return upload;
}

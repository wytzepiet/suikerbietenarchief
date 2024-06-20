import { SetStoreFunction, createStore } from "solid-js/store";
import { Tables } from "../supabase/types";
import { supabase } from "../supabase/client";
import { deleteMuxVideo } from "../mux/utils";

export type VideoData = { id: number } & Partial<Omit<Tables<"videos">, "id">>;

export class VideoRecord<T extends VideoData> {
  data: T;
  setData: SetStoreFunction<T>;

  constructor(data: T) {
    [this.data, this.setData] = createStore(data);
  }

  async save() {
    const { data, error } = await supabase().from("videos").upsert(this.data);
    if (error) console.error(error);
    if (data) this.setData(data[0]);
  }

  onDelete: (() => void)[] = [];

  async delete() {
    if (this.data.id)
      await supabase().from("videos").delete().eq("id", this.data.id);
    if (this.data.asset_id) await deleteMuxVideo(this.data.asset_id);
    this.onDelete.forEach((fn) => fn());
  }
  thumbnailUrl(props: { width?: number; height?: number }) {
    const url = new URL(
      `https://image.mux.com/${this.data.playback_id}/thumbnail.webp`
    );
    if (props.width) url.searchParams.set("width", props.width.toString());
    if (props.height) url.searchParams.set("height", props.height.toString());
    return url.toString();
  }
}

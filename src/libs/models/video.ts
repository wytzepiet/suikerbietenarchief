import { SetStoreFunction, createStore } from "solid-js/store";
import { Tables } from "../supabase/types";
import { supabase } from "../supabase/client";
import { deleteMuxVideo } from "../mux/utils";

export type VideoData = { id: number } & Partial<Omit<Tables<"videos">, "id">>;
const ref = supabase.from("videos");

export class Video<T extends VideoData> {
  data: T;
  setData: SetStoreFunction<T>;
  updates: VideoData;
  update: SetStoreFunction<VideoData>;

  constructor(data: T) {
    [this.data, this.setData] = createStore(data);
    [this.updates, this.update] = createStore({ id: data.id });
  }

  async fetchData(selector?: string) {
    if (!this.data.id) return;
    const res = await ref.select(selector).eq("id", this.data.id).single();
    if (res.error) console.error(res.error);
    if (res.data) this.setData(res.data as unknown as T);
  }

  async save() {
    const { data, error } = await ref.upsert(this.data);
    if (error) console.error(error);
    if (data) this.setData(data[0]);
  }

  onDelete: (() => void)[] = [];

  async delete() {
    if (this.data.id) await ref.delete().eq("id", this.data.id);
    if (this.data.asset_id) await deleteMuxVideo(this.data.asset_id);
    this.onDelete.forEach((fn) => fn());
  }

  thumbnailUrl({ width, height }: { width?: number; height?: number }) {
    if (!this.data.asset_id) return;
    return `https://image.mux.com/${this.data.asset_id}/thumbnail.jpg?width=${width}&height=${height}`;
  }
}

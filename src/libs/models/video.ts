import { Tables } from "../supabase/types";


function video<T extends Partial<Tables<"videos">>>(input: T) {


const video ={
    ...input
}

return video;
}

const test = video({id: 1, asset_id: "123", playback_id: "123"});


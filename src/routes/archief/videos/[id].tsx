import MuxPlayer from "@/components/muxPlayer";
import { Card, CardContent } from "@/components/ui/card";
import { createVideo } from "@/libs/datamodels/video";
import { createVideoList } from "@/libs/datamodels/videoList";
import { supabase } from "@/libs/services/supabase/client";
import { A, useNavigate, useParams } from "@solidjs/router";
import {
  createEffect,
  createMemo,
  createResource,
  onCleanup,
  onMount,
} from "solid-js";
import gsap from "gsap";
import { isServer } from "solid-js/web";

export default function VideoScreen() {
  const params = useParams();
  const navigate = useNavigate();

  const [data] = createResource(async () => {
    const res = await supabase.from("videos").select().eq("id", params.id);
    if (res.error) throw res.error;
    return res.data[0];
  });

  const video = createMemo(() => (data() ? createVideo(data()!) : undefined));

  const recommendations = createVideoList();
  recommendations.fetchVideos();

  let onGoBack = (e?: Event) => {};
  const goBack = (e?: Event) => onGoBack(e);

  onMount(() => {
    createEffect(async () => {
      const query = `.video-${video()?.data.id}`;
      const flipElements = document.querySelectorAll<HTMLElement>(query);
      if (!flipElements[1]) return;

      document.body.style.overflowY = "hidden";

      const { Flip } = await import("gsap/Flip");

      document.getElementById("main")!.style.opacity = "1";

      gsap.registerPlugin(Flip);
      const flipState = Flip.getState(query);

      const flip = (forward = true, onComplete?: Function) => {
        if (Flip.isFlipping(flipElements)) Flip.killFlipsOf(flipElements);
        flipElements[forward ? 1 : 0].style.display = "none";
        flipElements[forward ? 0 : 1].style.display = "block";

        Flip.from(flipState, {
          duration: 0.7,
          fade: true,
          absolute: true,
          simple: true,
          ease: "expo.out",
          zIndex: 40,
          onComplete: () => {
            if (onComplete) onComplete();
            flipElements.forEach((el) => (el.style.transform = ""));
          },
        });
      };
      flip();

      const dimBody = gsap.to(".archief", {
        duration: 0.5,
        ease: "power1.out",
        filter: "blur(10px)",
        opacity: 0.25,
      });

      onGoBack = (e?: Event) => {
        e?.preventDefault();
        document.body.style.overflowY = "scroll";

        flip(false, () => navigate("/archief", { scroll: false }));

        dimBody.kill();
        gsap.to(".archief", {
          duration: 0.2,
          ease: "power1.out",
          filter: "blur(0px)",
          opacity: 1,
        });

        onGoBack = () => {};
      };
    });
  });

  if (!isServer) onCleanup(goBack);

  return (
    <main
      id="main"
      class="fixed w-full h-screen inset-0 pt-[80px] px-4 pb-4 z-20 flex justify-center opacity-0"
      style={{ top: isServer ? "" : window.scrollY + "px" }}
    >
      <A
        href="/archief"
        class="overlay absolute inset-0"
        // onClick={goBack}
        noScroll
      />
      <Card
        class={`relative w-[700px] max-w-full h-full overflow-scroll video-${
          video()?.data.id
        }`}
        data-flip-id={video()?.data.id}
      >
        <div id="video" class="fade-in overflow-hidden border-b">
          <MuxPlayer autoplay video={video()!} />
        </div>

        <CardContent>
          <h1 class="text-3xl font-medium mt-8 mb-2">{video()?.data.title}</h1>
          <p class="text-muted-foreground">{video()?.data.description}</p>

          {/* <div class="h-8"></div>
          <h1 class="text-xl font-medium">Gerelateerde video's</h1>
          <div class="grid gap-4 grid-cols-1 md:grid-cols-2">
            <For each={recommendations.videos}>
              {(video) => {
                const [preview, setPreview] = createSignal(false);
                return (
                  <A href={`/videos/${video.data.id}`}>
                    <Card
                      class="relative overflow-hidden group"
                      onMouseOver={() => setPreview(true)}
                    >
                      <Show when={preview()}>
                        <img
                          class="absolute h-full w-full inset-0 object-cover scale-105"
                          src={video.thumbnailUrl({ type: "animated" })}
                          alt=""
                        />
                      </Show>
                      <img
                        class="w-full object-cover scale-105 aspect-video group-hover:opacity-0 transition-opacity duration-300"
                        src={video.thumbnailUrl()}
                        alt=""
                      />

                      <div class="absolute inset-0 bg-gradient-to-t from-background to-transparent">
                        <div class="absolute bottom-0 p-4">
                          <h2 class="text-xl font-medium line-clamp-1 overflow-ellipsis">
                            {video.data.title}
                          </h2>
                          <p class="text-muted-foreground text-sm line-clamp-1 overflow-ellipsis">
                            {video.data.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </A>
                );
              }}
            </For>
          </div> */}
        </CardContent>
      </Card>
    </main>
  );
}

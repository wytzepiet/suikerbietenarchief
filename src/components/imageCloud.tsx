import parallax from "@/libs/utils/parallax";
import { onCleanup, onMount } from "solid-js";
import { JSX } from "solid-js";

interface Props {
  images?: { url?: string; title: string }[];
  children?: JSX.Element;
}
export default function ImageCloud(props: Props) {
  if (!props.images)
    props.images = [
      { title: "Image 1" },
      { title: "Image 2" },
      { title: "Image 3" },
      { title: "Image 4" },
      { title: "Image 5" },
      { title: "Image 6" },
      { title: "Image 7" },
      { title: "Image 8" },
      { title: "Image 9" },
      { title: "Image 10" },
    ];

  let cloud: HTMLDivElement | undefined;
  let imgWidth = 400;
  const getImgWidth = () =>
    Math.min(Math.floor(Math.min(window.innerWidth * 0.4, 400)), 400);

  onMount(() => {
    imgWidth = getImgWidth();
    window.addEventListener("resize", () => (imgWidth = getImgWidth()));
  });

  const phi = Math.PI * (Math.sqrt(5) - 1);

  function fibonacciSphere(i: number) {
    const z = 1 - i / (props.images!.length - 1);
    const r = Math.sqrt(1 - z * z);

    const theta = phi * i;

    const x = Math.cos(theta) * r;
    const y = Math.sin(theta) * r;

    return [x, y, z * 0.4 + 0.4];
  }

  function moveImage(el: HTMLElement, x: number, y: number) {
    const centerX = cloud ? cloud.clientWidth / 2 : 0;
    const centerY = cloud ? cloud.clientHeight / 2 : 0;

    // const scale = parseFloat(el.style.scale ?? "1");
    const xPos = x * centerX + centerX - el.clientWidth / 2;
    const yPos = y * centerY + centerY - el.clientHeight / 2;

    el.style.left = Math.round(xPos) + "px";
    el.style.top = Math.round(yPos) + "px";
  }

  function setPosition(el: HTMLElement, i: number) {
    if (!cloud) return;
    const [x, y, z] = fibonacciSphere(i);
    const speed = Math.round(z * 100) / 100;

    el.style.zIndex = `${Math.round(speed * 20)}`;
    el.style.scale = `${speed + 0.2}`;
    el.querySelector("img")!.style.opacity = `${speed * 0.8 + 0.2}`;

    const move = () => moveImage(el, x, y);

    move();
    window.addEventListener("resize", move);
    onCleanup(() => window.removeEventListener("resize", move));

    parallax(el, () => speed);
  }

  const elements = props.images!.map((img, i) => (
    <div class="image absolute rounded-lg bg-background overflow-hidden w-[max(20vw,100px)]">
      <img
        src="https://cdn.sanity.io/images/te741qs0/production/31481400f8db79116c151f49ae8a420173599af8-5586x5698.jpg?w=311"
        alt={img.title}
        class="w-full"
      />
    </div>
  ));

  onMount(() => {
    elements.forEach((el, i) => setPosition(el as HTMLElement, i));
  });
  return (
    <div
      class="relative h-[max(100vw,100vh)] w-[90%] flex flex-col items-center justify-center"
      ref={cloud!}
    >
      {elements}
      <div class="z-30">{props.children}</div>
    </div>
  );
}

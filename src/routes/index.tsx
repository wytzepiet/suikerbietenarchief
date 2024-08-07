import AnimatedText from "@/components/animatedText";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { ChevronRight, Search } from "lucide-solid";
import { createSignal, onCleanup, onMount } from "solid-js";
import timelineStyle from "@/libs/timeline.module.css";
import "@mux/mux-player";
import inView from "@/libs/utils/inView";

const timeline = [
  {
    name: "Napoleon vaardigt decreet uit om suikerbieten te telen",
    description:
      "Tijdens de Napoleontische oorlogen en de Continentale Blokkade (1806-1814) werd de invoer van rietsuiker uit de koloniën bemoeilijkt. Dit leidde tot een intensievere ontwikkeling van de bietsuikerindustrie in Europa, inclusief Nederland.",
    date: "25 maart 1811",
  },
  {
    name: "Introductie van de Suikerbiet ",
    description:
      "In de late 18e eeuw werd de suikerbiet geïntroduceerd in Europa als een alternatief voor rietsuiker. Dit was een belangrijke stap omdat het de afhankelijkheid van geïmporteerde rietsuiker verminderde.",
    date: "18e eeuw",
  },
  {
    name: "Consolidatie en Fusies",
    description:
      "In de late 20e eeuw zagen we een consolidatie van de suikerindustrie in Nederland, met fusies van verschillende suikerfabrieken om te concurreren in de internationale markt.",
    date: "Laat 20e eeuw",
  },
  {
    name: "Verbetering van Teelttechnieken en Veredelingsprogramma's",
    description:
      "Gedurende de 19e eeuw werden de teelttechnieken en veredelingsprogramma's voor suikerbieten aanzienlijk verbeterd. Dit leidde tot hogere opbrengsten en een efficiëntere suikerproductie.",
    date: "19e eeuw",
  },
  {
    name: "Impact van de EU Suikermarkt Hervormingen",
    description:
      "In de 21e eeuw hadden de hervormingen van de EU-suikermarkt, zoals de afschaffing van het suikerquotum in 2017, een grote invloed op de Nederlandse suikerbietensector. Dit leidde tot veranderingen in productie en exportstrategieën.",
    date: "21e eeuw",
  },
  {
    name: "Eeste bietsuiker geproduceerd",
    description:
      "Deze wordt geproduceerd uit mangelwortels in de suikerraffinaarderij “De Oorsprong” te Oosterbeek, gesticht door Backer en Selis",
    date: "22 mei 1811",
  },
  {
    name: " Duurzaamheid en Innovatie",
    description:
      "De focus op duurzaamheid en innovatie speelt een steeds grotere rol in de bietsuikerteelt. Nederlandse suikerproducenten investeren in duurzame landbouwpraktijken en de ontwikkeling van nieuwe producten en technologieën.",
    date: "Hedendaags",
  },
];

export default function Index() {
  let [blur, setBlur] = createSignal(0);
  onMount(async () => {
    const { ScrollTrigger } = await import("gsap-trial/ScrollTrigger");
    const { ScrollSmoother } = await import("gsap-trial/ScrollSmoother");

    ScrollSmoother.create({
      smooth: 1, // how long (in seconds) it takes to "catch up" to the native scroll position
      effects: true, // looks for data-speed and data-lag attributes on elements
      smoothTouch: 0.1, // much shorter smoothing time on touch devices (default is NO smoothing on touch devices)
    });

    ScrollTrigger.create({
      trigger: ".blurrer",
      start: "top top",
      end: "bottom top",
      invalidateOnRefresh: true,
      onUpdate: (self) => setBlur(self.progress * 20),
    });

    document.querySelector("mux-player")?.addEventListener("canplay", () => {
      gsap.to("mux-player", { duration: 3, ease: "power2.in", opacity: 1 });
    });

    gsap.from(".searchbar", {
      duration: 1.5,
      opacity: 0,
      delay: 1,
      ease: "power3.out",
      y: 40,
      scrollTrigger: {
        trigger: ".searchbar",
        start: "top 80%",
        end: "bottom 20%",
      },
    });
  });

  return (
    <main class="flex flex-col items-center w-full">
      <div
        class="blurrer h-screen w-full flex flex-col justify-center items-center relative"
        style={`--blur: ${blur()}px;`}
      >
        <div data-speed="0.3" class="absolute inset-0 blur-[--blur]">
          <div class="absolute inset-0 overflow-hidden">
            {/* @ts-ignore */}
            <mux-player
              class="absolute inset-0 object-cover opacity-0"
              playback-id="o01EPwa914Z4SnGt2E527dU02L5gL69Pb25yvHI9R7cCA"
              autoplay
              loop
              muted
              style="--controls: none; --media-object-fit: cover"
              loadeddata={(e: HTMLElement) => {
                console.log("loadeddata", e);
                gsap.to(e, { duration: 1, opacity: 1 });
              }}
            />
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        <div class="relative flex flex-col items-center text-center" use:inView>
          <h2 class="text-6xl font-medium">
            <AnimatedText remote>Nationaal</AnimatedText>
          </h2>
          <h1 class="text-9xl font-medium">
            <AnimatedText
              class="flex flex-wrap justify-center"
              remote
              delay={200}
            >
              <span>Suiker</span>
              <span>Bieten</span>
              <span>Archief</span>
            </AnimatedText>
          </h1>
          <h2 class="text-4xl font-light text-muted-foreground">
            <AnimatedText remote delay={400}>
              Uit trots op ons erfgoed
            </AnimatedText>
          </h2>
          <form class="searchbar pt-4 mt-4">
            <TextFieldRoot
              class="relative animated delay-700"
              onsubmit={() => console.log("hoi")}
            >
              <TextField
                class="border-muted-foreground w-80"
                type="text"
                placeholder="Zoek in het archief..."
              />
              <div class="absolute right-0 top-0 h-full aspect-square !mt-0 flex justify-center items-center">
                <Search size="1em" class="text-muted-foreground" />
                <input
                  type="submit"
                  class="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </TextFieldRoot>
          </form>
        </div>
      </div>
      <div class="h-[70vh]"></div>

      <ImageCloud>
        <h1 class="text-9xl font-medium max-w-xl" use:inView>
          <AnimatedText remote>
            Ontdek het verhaal van de suikerbiet
          </AnimatedText>
        </h1>
      </ImageCloud>

      <div class="h-[40vh]"></div>

      <div class={timelineStyle.timeline}>
        <div
          class={timelineStyle.grid}
          use:inView
          style={`grid-template-rows: repeat(${timeline.length + 1}, auto);`}
        >
          <div class={timelineStyle.line}></div>
          {timeline.map((event) => (
            <div class={timelineStyle.item} id="timelineItem1" use:inView>
              <div class={timelineStyle.head}>
                <div class={timelineStyle.point}></div>
                <div class={timelineStyle.itemLine}></div>
                <h2 class={timelineStyle.year + " text-2xl"}>{event.date}</h2>
              </div>
              <div style="height: 25px"></div>
              <h2 class={`${timelineStyle.title} text-3xl font-semibold`}>
                {event.name}
              </h2>
              <div style="height: 1em"></div>
              <div class={timelineStyle.content}>
                <p>{event.description}</p>
                <a href="/" class="text-white">
                  Lees meer
                  <ChevronRight size="1em" class="inline" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function ImageCloud(props: {
  images?: { url?: string; title: string }[];
  children?: any;
}) {
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
    el.setAttribute("data-speed", speed.toString());
    const move = () => moveImage(el, x, y);

    move();
    window.addEventListener("resize", move);
    onCleanup(() => window.removeEventListener("resize", move));
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

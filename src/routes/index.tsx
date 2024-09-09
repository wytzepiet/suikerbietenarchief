import AnimatedText from "@/components/animatedText";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { ChevronRight, Search } from "lucide-solid";
import { createSignal, onCleanup, onMount } from "solid-js";
import timelineStyle from "@/libs/timeline.module.css";
import "@mux/mux-player";
import Page from "@/components/page";
import { Card } from "@/components/ui/card";
import { A } from "@solidjs/router";
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
    const { gsap } = await import("gsap");
    const { ScrollTrigger } = await import("gsap/ScrollTrigger");

    ScrollTrigger.create({
      trigger: ".blurrer",
      start: "top top",
      end: "bottom top",
      invalidateOnRefresh: true,
      onUpdate: (self) => setBlur(self.progress * 20),
    });

    document.querySelector("mux-player")?.addEventListener("canplay", () => {
      gsap.to("mux-player", { duration: 2, opacity: 1 });
    });
    gsap.from(".blurrer", {
      duration: 2,
      scale: 1.3,
      ease: "expo.out",
    });

    gsap.from(".searchbar", {
      duration: 1.5,
      opacity: 0,
      delay: 1,
      ease: "power3.out",
      y: 40,
    });
  });

  return (
    <Page class="flex flex-col items-center w-full" hideUntilMounted>
      <div
        class="blurrer h-screen w-full flex flex-col justify-end items-center relative"
        style={`--blur: ${blur()}px;`}
      >
        <div data-speed="0.1" class="absolute inset-0 blur-[--blur]">
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
        <div
          class="relative flex flex-col items-start w-full px-8 pb-20 max-w-[1500px]"
          use:inView
        >
          <h2 class="text-6xl font-medium">
            <AnimatedText scrollTrigger={false} remote>
              Nationaal
            </AnimatedText>
          </h2>
          <h1 class="text-8xl font-medium">
            <AnimatedText
              class="flex flex-wrap"
              scrollTrigger={false}
              remote
              delay={200}
            >
              <span>Suiker</span>
              <span>Bieten</span>
              <span>Archief</span>
            </AnimatedText>
          </h1>
          <h2 class="text-4xl font-light text-foreground/50">
            <AnimatedText remote scrollTrigger={false} delay={400}>
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
        <h1 class="text-8xl font-medium max-w-xl">
          <AnimatedText>Ontdek het verhaal van de suikerbiet</AnimatedText>
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
              </div>
            </div>
          ))}
        </div>
      </div>
      <div class="h-40"></div>
      <div class="relative p-4 flex flex-wrap gap-4">
        <A href="/kaart">
          <Card class="relative overflow-hidden max-w-lg group">
            <div class="group-hover:scale-105 transition duration-300">
              <img src="/map.png" class="opacity-30"></img>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <div class="p-4 max-w-md">
                  <h2 class="text-4xl">Bekijk de kaart</h2>
                  <p class="text-muted-foreground">
                    Ontdek de belangrijkste plaatsen in de Nederlandse
                    suikerindustrie
                  </p>
                  <div class="flex items-center">
                    <p>Ga naar de kaart</p>
                    <ChevronRight size="1.2em" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </A>
        <Card class="relative overflow-hidden max-w-lg group">
          <div class="group-hover:scale-105 transition duration-300">
            <img src="/map.png" class="opacity-30"></img>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <div class="p-4 max-w-md">
                <h2 class="text-4xl">Bekijk de kaart</h2>
                <p class="text-muted-foreground">
                  Ontdek de belangrijkste plaatsen in de Nederlandse
                  suikerindustrie
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Page>
  );
}

function ImageCloud(props: {
  images?: { url?: string; title: string }[];
  children?: any;
}) {
  if (!props.images)
    props.images = [
      {
        title: "Image 1",
        url: "https://cdn.sanity.io/images/te741qs0/production/1d7860b4d96c2c572bff229f630c464e1af77b46-4330x2711.jpg",
      },
      {
        title: "Image 2",
        url: "https://cdn.sanity.io/images/te741qs0/production/0856c5df18fdaefce4bd52180300de7de884f8fe-3063x4769.jpg",
      },
      {
        title: "Image 3",
        url: "https://cdn.sanity.io/images/te741qs0/production/a43eb20d498aa240b9cb8ed923f6046c0b6d94f2-5634x5746.jpg",
      },
      {
        title: "Image 4",
        url: "https://cdn.sanity.io/images/te741qs0/production/31481400f8db79116c151f49ae8a420173599af8-5586x5698.jpg",
      },
      {
        title: "Image 5",
        url: "https://cdn.sanity.io/images/te741qs0/production/46af6da4e3b4c8fd516911b6c278fef0baecd0ba-5594x5740.jpg",
      },
      {
        title: "Image 6",
        url: "https://cdn.sanity.io/images/te741qs0/production/7a0daa59f10d306979882c0a50be3ac702fdf5ce-5602x5802.jpg",
      },
      {
        title: "Image 7",
        url: "https://cdn.sanity.io/images/te741qs0/production/82cdb2f19b472d42313814d392ad58ac1f024978-5602x5673.jpg",
      },
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
    let speed = Math.round(z * 100) / 100;
    speed = 0.4 + speed * 0.6;

    el.style.zIndex = `${Math.round(speed * 20)}`;
    el.style.scale = `${speed}`;
    el.querySelector("img")!.style.opacity = `${speed * 0.8 + 0.2}`;
    el.setAttribute("data-speed", speed.toString());
    const move = () => moveImage(el, x, y);

    move();
    window.addEventListener("resize", move);
    onCleanup(() => window.removeEventListener("resize", move));
  }

  const elements = [...props.images, ...props.images].map((img, i) => (
    <div class="image absolute rounded-lg bg-background overflow-hidden w-[max(20vw,100px)]">
      <img
        src={
          (img.url ??
            "https://cdn.sanity.io/images/te741qs0/production/31481400f8db79116c151f49ae8a420173599af8-5586x5698.jpg") +
          "?w=500"
        }
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

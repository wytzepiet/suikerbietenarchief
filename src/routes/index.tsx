import AnimatedText from "@/components/animatedText";
import ImageCloud from "@/components/imageCloud";
import MuxPlayer from "@/components/muxPlayer";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import inView from "@/libs/inView";
import parallax from "@/libs/parallax";
import { ChevronRight, Search } from "lucide-solid";
import { createSignal, onMount } from "solid-js";
import timelineStyle from "@/libs/timeline.module.css";

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
  function blurOnScroll() {
    const amount = (window.scrollY / window.innerHeight) * 17;
    setBlur(Math.round(Math.min(20, amount)));
  }
  onMount(() => {
    blurOnScroll();
    window.addEventListener("scroll", blurOnScroll);
    return () => window.removeEventListener("scroll", blurOnScroll);
  });

  return (
    <main class="flex flex-col items-center">
      <div
        class="h-screen w-full flex flex-col justify-center items-center relative"
        style={`--blur: ${blur()}px;`}
      >
        <div class="absolute inset-0 blur-[--blur]" use:parallax={0.4}>
          <div class="absolute inset-0 overflow-hidden">
            <MuxPlayer
              playbackId="o01EPwa914Z4SnGt2E527dU02L5gL69Pb25yvHI9R7cCA"
              class="absolute inset-0"
              style="--controls: none; --media-object-fit: cover"
              autoplay
            />
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        <div class="relative flex flex-col items-center" use:inView>
          <h2 class="text-5xl font-medium text-muted-foreground">
            <AnimatedText remote>Nationaal</AnimatedText>
          </h2>
          <h1 class="text-6xl font-medium">
            <AnimatedText remote delay={200}>
              Suikerbietenarchief
            </AnimatedText>
          </h1>
          <h2 class="text-2xl font-light text-muted-foreground">
            <AnimatedText remote delay={400}>
              Uit trots op ons erfgoed
            </AnimatedText>
          </h2>
          <form class="pt-4 mt-4">
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
      <div class="h-[50vh]"></div>

      <ImageCloud>
        <h1 class="text-8xl font-medium max-w-xl" use:inView>
          <AnimatedText remote>
            Ontdek het verhaal van de suikerbiet
          </AnimatedText>
        </h1>
      </ImageCloud>

      <div class="h-[20vh]"></div>

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

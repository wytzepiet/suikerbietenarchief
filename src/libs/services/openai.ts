import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";

const openai = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateMetadata(
  title: string | null | undefined,
  hint: string | null | undefined,
  transcript: string | null | undefined
) {
  "use server";
  if (!title || !transcript) return undefined;

  const instruction = `
  Hier is een titel, een korte beschrijving en een automatisch gegenereerde transcriptie van een video. 
  De video komt terecht in een beeldarchief over de suikerindustrie in Nederland. 

  Ik wil graag drie dingen:
  1. keywords: Identificeer de belangrijkste en onderscheidende zoektermen die specifiek zijn voor de inhoud van deze video, maar vermijd generieke termen zoals 'suiker' en 'biet'. Geef maximaal 20 termen.
  2. description: Schrijf een kort stukje tekst dat geschikt is als beschrijving onder de video. Gebruik maximaal 500 tekens.
  3. locations: Als er plaatsnamen genoemd worden die relevant zijn voor deze video, geef mij dan die locaties. Geen gebieden, provincies of landen, alleen specifieke plaatsen.
  `;

  const responseFormat = z.object({
    keywords: z.string().array(),
    description: z.string(),
    locations: z.string().array(),
  });

  const res = await openai().beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      { role: "system", content: instruction },
      {
        role: "user",
        content: `Titel: ${title}\n\nBeschrijving: ${hint}\n\nTranscriptie: ${transcript}`,
      },
    ],
    response_format: zodResponseFormat(responseFormat, "video_metadata"),
  });

  console.log("openai data", res.choices[0].message.parsed);
  return res.choices[0].message.parsed;
}

export async function generateLocationDescription(name: string) {
  "use server";
  const instruction = `
    Geef mij een korte beschrijving van deze locatie met betrekking tot de suikerindustrie in Nederland.
  `;

  const responseFormat = z.object({
    description: z.string(),
  });

  const res = await openai().beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      { role: "system", content: instruction },
      { role: "user", content: name },
    ],
    response_format: zodResponseFormat(responseFormat, "location_description"),
  });

  console.log("openai data", res.choices[0].message.parsed);
  return { ...res.choices[0].message.parsed };
}

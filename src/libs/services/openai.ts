"use server";

import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";

const openai = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateMetadata(
  title: string | null | undefined,
  hint: string | null | undefined,
  transcript: string | null | undefined
) {
  if (!title || !transcript) return undefined;
  const instructionPrefix =
    "Hier is een titel, een korte beschrijving en een automatisch gegenereerde transcriptie van een video. De video komt terecht in een beeldarchief over de suikerindustrie in Nederland. ";
  async function gpt(
    instruction: string,
    settings?: {
      responseformat?:
        | OpenAI.ResponseFormatText
        | OpenAI.ResponseFormatJSONObject
        | OpenAI.ResponseFormatJSONSchema
        | undefined;
    }
  ) {
    const response = await openai().chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: instructionPrefix + instruction },
        {
          role: "user",
          content:
            "Titel: " +
            title +
            "\n\nBeschrijving: " +
            hint +
            "\n\nTranscriptie: " +
            transcript,
        },
      ],
      temperature: 0.5,
      max_tokens: 500,
      response_format: settings?.responseformat,
    });
    return response.choices?.[0]?.message?.content ?? undefined;
  }

  const keywordsObject = z.string().array().min(10).max(20);

  const [keywords, description] = await Promise.all([
    gpt(
      "Identificeer de belangrijkste en onderscheidende zoektermen die specifiek zijn voor de inhoud van deze video, maar vermijd generieke termen zoals 'suiker' en 'biet'.",
      { responseformat: zodResponseFormat(keywordsObject, "keywords") }
    ),
    gpt(
      "Schrijf een kort stukje tekst dat geschikt is als beschrijving onder de video. Gebruik maximaal 500 tekens."
    ),
  ]);

  if (!keywords || !description) return undefined;
  return { keywords: keywords.split(", "), description };
}

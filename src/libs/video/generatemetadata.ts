"use server";

import OpenAI from "openai";

const openai = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateMetadata(
	title: string | null | undefined,
	hint: string | null | undefined,
	transcript: string | null | undefined
) {
	if (!title || !transcript) return undefined;
	const instructionPrefix =
		'Hier is een titel, een korte beschrijving en een automatisch gegenereerde transcriptie van een video. De video komt terecht in een beeldarchief over de suikerindustrie in Nederland. ';
	async function gpt(instruction: string) {
		const response = await openai().chat.completions.create({
			model: 'gpt-4o',
			messages: [
				{ role: 'system', content: instructionPrefix + instruction },
				{
					role: 'user',
					content:
						'Titel: ' +
						title +
						'\n\nBeschrijving: ' +
						hint +
						'\n\nTranscriptie: ' +
						transcript
				}
			],
			temperature: 0.5,
			max_tokens: 500
		});
		return response.choices?.[0]?.message?.content ?? undefined;
	}

	const [keywords, description] = await Promise.all([
		gpt(
			"Identificeer de belangrijkste en onderscheidende zoektermen die specifiek zijn voor de inhoud van deze video, maar vermijd generieke termen zoals 'suiker' en 'biet'. Geef de zoektermen als één lap tekst zonder leestekens of hoofdletters, met de termen gescheiden door een komma en een spatie. Geef maximaal 20 termen."
		),
		gpt(
			'Schrijf een kort stukje tekst dat een idee geeft waar de video over gaat. Gebruik maximaal 500 tekens.'
		)
	]);
	if (!keywords || !description) return undefined;
	return { keywords: keywords.split(', '), description };
}
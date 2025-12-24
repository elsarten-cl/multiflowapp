'use server';

/**
 * @fileOverview A flow that generates a structured draft from a simple idea and selected tone.
 *
 * - generateContentDraft - A function that generates a structured draft.
 * - GenerateContentDraftInput - The input type for the generateContentDraft function.
 * - GenerateContentDraftOutput - The return type for the generateContentDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { PostTypeEnum } from '@/lib/schemas';

const ToneEnum = z.enum([
  'Persuasivo',
  'Estrategico',
  'Influencer',
  'Inspirador',
  'Periodista',
  'Corporativo',
  'Humoristico',
]);

const GenerateContentDraftInputSchema = z.object({
  idea: z
    .string()
    .describe('The main idea for which to generate a content draft.'),
  selectedTone: ToneEnum.describe('The tone of voice to use for the content draft.'),
  postType: PostTypeEnum.describe('The type of the post, either article or product.'),
});
export type GenerateContentDraftInput = z.infer<typeof GenerateContentDraftInputSchema>;

const GenerateContentDraftOutputSchema = z.object({
  draft: z
    .string()
    .describe(
      'A structured draft with "Oferta de valor", "Problema / solución", "Historia / contexto", "Conexión territorial", and "CTA sugerido" fields, optimized for the selected tone. The output should be formatted as "Field: [content]\\n...".'
    ),
});
export type GenerateContentDraftOutput = z.infer<typeof GenerateContentDraftOutputSchema>;

export async function generateContentDraft(
  input: GenerateContentDraftInput
): Promise<GenerateContentDraftOutput> {
  return generateContentDraftFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContentDraftPrompt',
  input: {schema: GenerateContentDraftInputSchema},
  output: {schema: GenerateContentDraftOutputSchema},
  prompt: `You are a content creation assistant. Your task is to generate a structured draft based on the given idea, selected tone, and post type.

Idea: {{{idea}}}
Tone: {{{selectedTone}}}
Post Type: {{{postType}}}

The draft should include the following sections: "Oferta de valor", "Problema / solución", "Historia / contexto", "Conexión territorial", and "CTA sugerido". 
If the Post Type is 'producto', make sure the content is oriented towards selling a product.
The output MUST be a string formatted exactly like this, with each field on a new line:
Oferta de valor: [content]
Problema / solución: [content]
Historia / contexto: [content]
Conexión territorial: [content]
CTA sugerido: [content]
`,
});

const generateContentDraftFlow = ai.defineFlow(
  {
    name: 'generateContentDraftFlow',
    inputSchema: GenerateContentDraftInputSchema,
    outputSchema: GenerateContentDraftOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

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
});
export type GenerateContentDraftInput = z.infer<typeof GenerateContentDraftInputSchema>;

const GenerateContentDraftOutputSchema = z.object({
  draft: z
    .string()
    .describe(
      'A structured draft with suggested fields and content snippets, optimized for the selected tone.'
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
  prompt: `You are a content creation assistant. Your task is to generate a structured draft based on the given idea and the selected tone.

Idea: {{{idea}}}
Tone: {{{selectedTone}}}

The draft should include suggested fields and content snippets to help the user quickly start building their content, optimized for the selected tone. The output should be a well-organized and coherent draft.
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

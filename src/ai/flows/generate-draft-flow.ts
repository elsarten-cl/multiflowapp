'use server';

/**
 * @fileOverview A flow that generates a structured draft from a simple idea or topic.
 *
 * - generateDraft - A function that generates a structured draft.
 * - GenerateDraftInput - The input type for the generateDraft function.
 * - GenerateDraftOutput - The return type for the generateDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDraftInputSchema = z.object({
  topic: z
    .string()
    .describe('The main topic or idea for which to generate a draft.'),
});
export type GenerateDraftInput = z.infer<typeof GenerateDraftInputSchema>;

const GenerateDraftOutputSchema = z.object({
  draft: z
    .string()
    .describe(
      'A structured draft with suggested sections and content snippets.'
    ),
});
export type GenerateDraftOutput = z.infer<typeof GenerateDraftOutputSchema>;

export async function generateDraft(input: GenerateDraftInput): Promise<GenerateDraftOutput> {
  return generateDraftFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDraftPrompt',
  input: {schema: GenerateDraftInputSchema},
  output: {schema: GenerateDraftOutputSchema},
  prompt: `You are a content creation assistant. Your task is to generate a structured draft based on the given topic.

Topic: {{{topic}}}

The draft should include suggested sections and content snippets to help the user quickly start building their content. The output should be a well-organized and coherent draft.`,
});

const generateDraftFlow = ai.defineFlow(
  {
    name: 'generateDraftFlow',
    inputSchema: GenerateDraftInputSchema,
    outputSchema: GenerateDraftOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

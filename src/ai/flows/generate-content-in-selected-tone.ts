'use server';
/**
 * @fileOverview Generates content optimized for different platforms based on a draft.
 *
 * - generateContentInSelectedTone - A function that generates content for various platforms.
 * - GenerateContentInSelectedToneInput - The input type for the generateContentInSelectedTone function.
 * - GenerateContentInSelectedToneOutput - The return type for the generateContentInSelectedTone function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContentInSelectedToneInputSchema = z.object({
  draft: z.string().describe('The completed draft content.'),
  platform: z
    .enum(['facebook', 'instagram', 'wordpress'])
    .describe('The platform for which to generate content.'),
  tone: z.string().describe('The desired tone of the content (e.g., professional, casual).'),
});
export type GenerateContentInSelectedToneInput = z.infer<
  typeof GenerateContentInSelectedToneInputSchema
>;

const GenerateContentInSelectedToneOutputSchema = z.object({
  content: z.string().describe('The generated content optimized for the specified platform.'),
});
export type GenerateContentInSelectedToneOutput = z.infer<
  typeof GenerateContentInSelectedToneOutputSchema
>;

export async function generateContentInSelectedTone(
  input: GenerateContentInSelectedToneInput
): Promise<GenerateContentInSelectedToneOutput> {
  return generateContentInSelectedToneFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContentInSelectedTonePrompt',
  input: {schema: GenerateContentInSelectedToneInputSchema},
  output: {schema: GenerateContentInSelectedToneOutputSchema},
  prompt: `You are an expert social media manager. Generate content optimized for {{{platform}}} based on the following draft and desired tone.

Draft: {{{draft}}}
Tone: {{{tone}}}

Consider the platform's specific requirements and best practices.`,
});

const generateContentInSelectedToneFlow = ai.defineFlow(
  {
    name: 'generateContentInSelectedToneFlow',
    inputSchema: GenerateContentInSelectedToneInputSchema,
    outputSchema: GenerateContentInSelectedToneOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

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
import { PlatformEnum } from '@/lib/schemas';

const GenerateContentInSelectedToneInputSchema = z.object({
  textInput: z.string().describe('The base text content.'),
  selectedTone: z
    .enum([
      'Persuasivo',
      'Estrategico',
      'Influencer',
      'Inspirador',
      'Periodista',
      'Corporativo',
      'Humoristico',
    ])
    .describe('The tone of voice for the content.'),
  platform: PlatformEnum.describe('The platform for which to generate content.'),
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
  prompt: `You are an expert social media manager. Generate content optimized for {{{platform}}} based on the following text and desired tone.

Text: {{{textInput}}}
Tone: {{{selectedTone}}}

Consider the platform's specific requirements and best practices (e.g., character limits, hashtags for Instagram, formatting for WordPress).`,
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

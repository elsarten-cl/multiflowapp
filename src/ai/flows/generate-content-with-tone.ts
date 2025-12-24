'use server';
/**
 * @fileOverview Generates content optimized for different platforms based on a draft.
 *
 * - generateContentWithTone - A function that generates content for various platforms.
 * - GenerateContentWithToneInput - The input type for the generateContentWithTone function.
 * - GenerateContentWithToneOutput - The return type for the generateContentWithTone function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContentWithToneInputSchema = z.object({
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
});
export type GenerateContentWithToneInput = z.infer<
  typeof GenerateContentWithToneInputSchema
>;

const GenerateContentWithToneOutputSchema = z.object({
  content: z.string().describe('The generated content optimized for web and social media.'),
});
export type GenerateContentWithToneOutput = z.infer<
  typeof GenerateContentWithToneOutputSchema
>;

export async function generateContentWithTone(
  input: GenerateContentWithToneInput
): Promise<GenerateContentWithToneOutput> {
  return generateContentWithToneFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContentWithTonePrompt',
  input: {schema: GenerateContentWithToneInputSchema},
  output: {schema: GenerateContentWithToneOutputSchema},
  prompt: `You are an expert content creator. Generate content optimized for web and social media based on the following text and desired tone.\n\nText: {{{textInput}}}\nTone: {{{selectedTone}}}\n\nConsider the platform's specific requirements and best practices. The output should be a well-organized and coherent content.`, // Changed draft to textInput
});

const generateContentWithToneFlow = ai.defineFlow(
  {
    name: 'generateContentWithToneFlow',
    inputSchema: GenerateContentWithToneInputSchema,
    outputSchema: GenerateContentWithToneOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

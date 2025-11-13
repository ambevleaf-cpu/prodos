'use server';
/**
 * @fileOverview A flow for translating text between English and Hindi.
 *
 * This file previously contained an AI-powered translation flow.
 * It has been replaced with a simple, non-AI dictionary-based translation.
 * The core logic is now in `src/app/actions.ts`.
 * This file is kept for type definitions.
 *
 * - translateText - A function that handles the translation.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */
import {z} from 'genkit';

export const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  targetLanguage: z.enum(['English', 'Hindi']).describe('The language to translate the text into.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

export const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

// This function is no longer an AI flow.
export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  // The actual translation logic is now in handleTranslate in src/app/actions.ts
  // This is a placeholder to keep the type exports.
  throw new Error('This function should not be called directly. Use handleTranslate action.');
}

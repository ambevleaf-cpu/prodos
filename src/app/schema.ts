import { z } from 'zod';

export const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

export const TextToSpeechOutputSchema = z.object({
  audioUrl: z.string().describe('The data URL of the generated audio file.'),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export const ChatWithNexbroInputSchema = z.object({
  message: z.string().describe('The user\'s message to the chatbot.'),
});
export type ChatWithNexbroInput = z.infer<typeof ChatWithNexbroInputSchema>;

export const ChatWithNexbroOutputSchema = z.object({
  reply: z.string().describe('The chatbot\'s reply in Hinglish.'),
});
export type ChatWithNexbroOutput = z.infer<typeof ChatWithNexbroOutputSchema>;

export const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  targetLanguage: z.enum(['English', 'Hindi']).describe('The language to translate the text into.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

export const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

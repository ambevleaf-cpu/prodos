import { z } from 'zod';

export const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

export const TextToSpeechOutputSchema = z.object({
  audioUrl: z.string().describe('The data URL of the generated audio file.'),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

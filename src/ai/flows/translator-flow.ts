'use server';
/**
 * @fileOverview A flow for translating text between English and Hindi.
 *
 * - translateText - A function that handles the translation.
 */
import { ai } from '@/ai/genkit';
import { TranslateTextInputSchema, TranslateTextOutputSchema, type TranslateTextInput, type TranslateTextOutput } from '@/app/schema';


const translatorPrompt = ai.definePrompt({
    name: 'translatorPrompt',
    input: { schema: TranslateTextInputSchema },
    output: { schema: TranslateTextOutputSchema },
    prompt: `Translate the following text to {{targetLanguage}}.

Text: {{{text}}}

Translation:`,
});

const translatorFlow = ai.defineFlow(
    {
        name: 'translatorFlow',
        inputSchema: TranslateTextInputSchema,
        outputSchema: TranslateTextOutputSchema,
    },
    async (input) => {
        const { output } = await translatorPrompt(input);
        return output!;
    }
);

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  const result = await translatorFlow(input);
  return result;
}

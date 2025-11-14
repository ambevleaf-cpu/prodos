'use server';
/**
 * @fileOverview A flow for the Nexbro chatbot.
 *
 * - chatWithNexbro - A function that handles the chatbot conversation.
 */
import { ai } from '@/ai/genkit';
import { ChatWithNexbroInputSchema, ChatWithNexbroOutputSchema, type ChatWithNexbroInput, type ChatWithNexbroOutput } from '@/app/schema';

const nexbroPrompt = ai.definePrompt({
  name: 'nexbroPrompt',
  input: { schema: ChatWithNexbroInputSchema },
  output: { schema: ChatWithNexbroOutputSchema },
  prompt: `You are Nexbro, a friendly AI assistant who talks in Hinglish (a mix of Hindi and English) like a cool, helpful big brother. 
  Your name is Nexbro.
  Be casual, friendly, and use words like "yaar", "bhai", "boss", "arre", "dekh", "tension mat le", etc. 
  Keep your responses conversational, helpful, and not too long.
  
  User's message: {{{message}}}
  
  Your reply:`,
});

const nexbroFlow = ai.defineFlow(
  {
    name: 'nexbroFlow',
    inputSchema: ChatWithNexbroInputSchema,
    outputSchema: ChatWithNexbroOutputSchema,
  },
  async (input) => {
    const { output } = await nexbroPrompt(input);
    return output!;
  }
);

export async function chatWithNexbro(input: ChatWithNexbroInput): Promise<ChatWithNexbroOutput> {
  const result = await nexbroFlow(input);
  return result;
}

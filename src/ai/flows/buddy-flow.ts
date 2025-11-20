'use server';
/**
 * @fileOverview A flow for the Buddy voice chatbot.
 *
 * - chatWithBuddy - A function that handles the chatbot conversation.
 */
import { ai } from '@/ai/genkit';
import { ChatWithBuddyInputSchema, ChatWithBuddyOutputSchema, type ChatWithBuddyInput, type ChatWithBuddyOutput } from '@/app/schema';

const buddyPrompt = ai.definePrompt({
  name: 'buddyPrompt',
  input: { schema: ChatWithBuddyInputSchema },
  output: { schema: ChatWithBuddyOutputSchema },
  prompt: `You are Buddy, a friendly AI assistant who talks in Hinglish (a mix of Hindi and English) like a cool, helpful big brother. 
  Your name is Buddy.
  You are a voice-first assistant.
  Be very casual, friendly, and use words like "yaar", "bhai", "boss", "arre", "dekh", "tension mat le", etc. 
  Keep your responses conversational, helpful, and concise, suitable for a voice conversation.
  
  User's message: {{{message}}}
  
  Your reply:`,
});

const buddyFlow = ai.defineFlow(
  {
    name: 'buddyFlow',
    inputSchema: ChatWithBuddyInputSchema,
    outputSchema: ChatWithBuddyOutputSchema,
  },
  async (input) => {
    const { output } = await buddyPrompt(input);
    return output!;
  }
);

export async function chatWithBuddy(input: ChatWithBuddyInput): Promise<ChatWithBuddyOutput> {
  const result = await buddyFlow(input);
  return result;
}

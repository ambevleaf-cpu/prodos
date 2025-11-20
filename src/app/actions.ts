'use server';

import { naturalLanguageSearch, type NaturalLanguageSearchOutput } from '@/ai/flows/natural-language-search';
import { translateText as translateTextFlow } from '@/ai/flows/translator-flow';
import { textToSpeech } from '@/ai/flows/tts-flow';
import { chatWithNexbro } from '@/ai/flows/nexbro-flow';
import { chatWithBuddy } from '@/ai/flows/buddy-flow';
import { type TextToSpeechInput, type TextToSpeechOutput, type ChatWithNexbroInput, type ChatWithNexbroOutput, type TranslateTextInput, type TranslateTextOutput, type ChatWithBuddyInput, type ChatWithBuddyOutput } from './schema';

export async function handleSearch(
  prevState: any,
  formData: FormData
): Promise<{
  results: NaturalLanguageSearchOutput | null;
  error: string | null;
  timestamp: number;
}> {
  const query = formData.get('query');
  if (typeof query !== 'string' || query.length < 3) {
    return { results: null, error: 'Query must be at least 3 characters.', timestamp: Date.now() };
  }

  try {
    const results = await naturalLanguageSearch({ query });
    return { results, error: null, timestamp: Date.now() };
  } catch (error) {
    console.error(error);
    return { results: null, error: 'An error occurred during the search.', timestamp: Date.now() };
  }
}

export async function handleTranslate(input: TranslateTextInput): Promise<{
  result: TranslateTextOutput | null;
  error: string | null;
}> {
    if (!input.text) {
        return { result: null, error: 'Please enter text to translate.' };
    }
    
    try {
        const result = await translateTextFlow(input);
        return { result, error: null };
    } catch (error) {
        console.error(error);
        return { result: null, error: 'An error occurred during translation.' };
    }
}

export async function handleTextToSpeech(input: TextToSpeechInput): Promise<{
  result: TextToSpeechOutput | null;
  error: string | null;
}> {
    if (!input.text) {
        return { result: null, error: 'Please enter text to generate speech.' };
    }
    
    try {
        const result = await textToSpeech(input);
        return { result, error: null };
    } catch (error) {
        console.error(error);
        return { result: null, error: 'An error occurred during speech generation.' };
    }
}

export async function handleNexbroChat(input: ChatWithNexbroInput): Promise<{
  result: ChatWithNexbroOutput | null;
  error: string | null;
}> {
    if (!input.message) {
        return { result: null, error: 'Please enter a message.' };
    }
    
    try {
        const result = await chatWithNexbro(input);
        return { result, error: null };
    } catch (error) {
        console.error('Nexbro Chat Error:', error);
        return { result: null, error: 'Arre bhai, thoda technical issue aa gaya! Dubara try kar 😅' };
    }
}

export async function handleBuddyChat(input: ChatWithBuddyInput): Promise<{
  result: ChatWithBuddyOutput | null;
  error: string | null;
}> {
    if (!input.message) {
        return { result: null, error: 'Please enter a message.' };
    }
    
    try {
        const result = await chatWithBuddy(input);
        return { result, error: null };
    } catch (error) {
        console.error('Buddy Chat Error:', error);
        return { result: null, error: 'Yaar, abhi thoda problem hai. Ek min baad try kar! 🤔' };
    }
}

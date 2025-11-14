'use server';

import { naturalLanguageSearch, type NaturalLanguageSearchOutput } from '@/ai/flows/natural-language-search';
import { type TranslateTextInput, type TranslateTextOutput } from '@/ai/flows/translator-flow';
import { textToSpeech } from '@/ai/flows/tts-flow';
import { chatWithNexbro } from '@/ai/flows/nexbro-flow';
import { type TextToSpeechInput, type TextToSpeechOutput, type ChatWithNexbroInput, type ChatWithNexbroOutput } from './schema';

const dictionary = {
  'hello': 'नमस्ते',
  'world': 'दुनिया',
  'how are you?': 'आप कैसे हैं?',
  'i am fine': 'मैं ठीक हूँ',
  'thank you': 'धन्यवाद',
  'good morning': 'सुप्रभात',
  'good night': 'शुभ रात्रि',
  'what is your name?': 'आपका नाम क्या है?',
  'my name is': 'मेरा नाम है',
  'computer': 'कंप्यूटर',
  'नमस्ते': 'hello',
  'दुनिया': 'world',
  'आप कैसे हैं?': 'how are you?',
  'मैं ठीक हूँ': 'i am fine',
  'धन्यवाद': 'thank you',
  'सुप्रभात': 'good morning',
  'शुभ रात्रि': 'good night',
  'आपका नाम क्या है?': 'what is your name?',
  'मेरा नाम है': 'my name is',
  'कंप्यूटर': 'computer',
} as const;

type DictionaryKey = keyof typeof dictionary;

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
        const lowerCaseText = input.text.toLowerCase() as DictionaryKey;
        const translatedText = dictionary[lowerCaseText] || 'Translation not found in dictionary.';

        // Fake delay to simulate network
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const result = { translatedText };
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

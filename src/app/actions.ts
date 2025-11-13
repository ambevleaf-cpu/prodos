'use server';

import { naturalLanguageSearch, type NaturalLanguageSearchOutput } from '@/ai/flows/natural-language-search';
import { translateText, type TranslateTextInput, type TranslateTextOutput } from '@/ai/flows/translator-flow';

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
        const result = await translateText(input);
        return { result, error: null };
    } catch (error) {
        console.error(error);
        return { result: null, error: 'An error occurred during translation.' };
    }
}

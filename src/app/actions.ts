'use server';

import { naturalLanguageSearch, type NaturalLanguageSearchOutput } from '@/ai/flows/natural-language-search';

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

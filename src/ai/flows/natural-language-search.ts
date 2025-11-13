'use server';

/**
 * @fileOverview implements a Genkit flow for natural language search. Allows users to search for files,
 * applications, and settings using natural language queries.
 *
 * - naturalLanguageSearch - A function that handles the natural language search process.
 * - NaturalLanguageSearchInput - The input type for the naturalLanguageSearch function.
 * - NaturalLanguageSearchOutput - The return type for the naturalLanguageSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { performGoogleSearch } from './google-search';

const NaturalLanguageSearchInputSchema = z.object({
  query: z.string().describe('The natural language query to use for search.'),
});
export type NaturalLanguageSearchInput = z.infer<typeof NaturalLanguageSearchInputSchema>;

const NaturalLanguageSearchOutputSchema = z.object({
  searchUrl: z.string().describe('A URL to the search results page.'),
  refinedQuery: z.string().optional().describe('A refined query for better search results, if applicable.'),
});
export type NaturalLanguageSearchOutput = z.infer<typeof NaturalLanguageSearchOutputSchema>;

export async function naturalLanguageSearch(input: NaturalLanguageSearchInput): Promise<NaturalLanguageSearchOutput> {
  return naturalLanguageSearchFlow(input);
}

const naturalLanguageSearchFlow = ai.defineFlow(
  {
    name: 'naturalLanguageSearchFlow',
    inputSchema: NaturalLanguageSearchInputSchema,
    outputSchema: NaturalLanguageSearchOutputSchema,
  },
  async (input) => {
    const { searchUrl } = await performGoogleSearch(input);
    return {
      searchUrl,
    };
  }
);

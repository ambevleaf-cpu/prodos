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

const NaturalLanguageSearchInputSchema = z.object({
  query: z.string().describe('The natural language query to use for search.'),
});
export type NaturalLanguageSearchInput = z.infer<typeof NaturalLanguageSearchInputSchema>;

const NaturalLanguageSearchOutputSchema = z.object({
  results: z.array(z.string()).describe('A list of search results.'),
  refinedQuery: z.string().describe('A refined query for better search results, if applicable.'),
});
export type NaturalLanguageSearchOutput = z.infer<typeof NaturalLanguageSearchOutputSchema>;

export async function naturalLanguageSearch(input: NaturalLanguageSearchInput): Promise<NaturalLanguageSearchOutput> {
  return naturalLanguageSearchFlow(input);
}

const refineSearchQuery = ai.defineTool({
  name: 'refineSearchQuery',
  description: 'Refines the search query to provide better search results.',
  inputSchema: z.object({
    originalQuery: z.string().describe('The original search query.'),
    reason: z.string().describe('The reason for refining the query.'),
  }),
  outputSchema: z.string().describe('The refined search query.'),
},
async (input) => {
  // Placeholder implementation for refining the search query.
  // In a real application, this would use an external search API like Google.
  return `Refined: ${input.originalQuery} - ${input.reason}`;
}
);

const performGoogleSearch = ai.defineTool({
    name: 'performGoogleSearch',
    description: 'Performs a google search and returns the results.',
    inputSchema: z.object({
        query: z.string().describe('The query to search for on Google'),
    }),
    outputSchema: z.array(z.string()).describe('A list of search results from Google.'),
},
async (input) => {
    // Placeholder implementation for calling google search API.
    return [`Google Result 1 for: ${input.query}`, `Google Result 2 for: ${input.query}`];
}
);

const naturalLanguageSearchPrompt = ai.definePrompt({
  name: 'naturalLanguageSearchPrompt',
  input: {schema: NaturalLanguageSearchInputSchema},
  output: {schema: NaturalLanguageSearchOutputSchema},
  tools: [refineSearchQuery, performGoogleSearch],
  prompt: `You are a search assistant that helps users find files, applications, and settings.
  Use the provided tools to refine the search query if necessary and perform the final search.

  User Query: {{{query}}}

  If the query is ambiguous or can be improved, use the refineSearchQuery tool to get a better query.
  Otherwise, use the performGoogleSearch tool to search for the query.

  Return the search results and the refined query (if applicable).`,
});

const naturalLanguageSearchFlow = ai.defineFlow(
  {
    name: 'naturalLanguageSearchFlow',
    inputSchema: NaturalLanguageSearchInputSchema,
    outputSchema: NaturalLanguageSearchOutputSchema,
  },
  async input => {
    const {output} = await naturalLanguageSearchPrompt(input);
    return output!;
  }
);

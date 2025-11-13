'use server';
/**
 * @fileOverview A Google search tool.
 *
 * - performGoogleSearch - A tool that performs a Google search.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const performGoogleSearch = ai.defineTool(
  {
    name: 'performGoogleSearch',
    description: 'Performs a google search and returns a URL to the search results.',
    inputSchema: z.object({
      query: z.string().describe('The query to search for on Google'),
    }),
    outputSchema: z.string().describe('A URL for the Google search results page.'),
  },
  async (input) => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(input.query)}&igu=1`;
    console.log(`Generated Google Search URL: ${searchUrl}`);
    return searchUrl;
  }
);

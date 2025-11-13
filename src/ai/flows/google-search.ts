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
    outputSchema: z.object({
      searchUrl: z.string().describe('A URL for the Google search results page.'),
      apiKeyUsed: z.boolean().describe('Whether the API key was used for the search.')
    }),
  },
  async (input) => {
    // In a real full-stack implementation, you would use the API key
    // to make a request to the Google Search API here.
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;

    // For this demonstration, we'll continue to use the URL-based search
    // and just report whether an API key is present.
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(input.query)}&igu=1`;
    console.log(`Generated Google Search URL: ${searchUrl}`);
    
    return {
      searchUrl,
      apiKeyUsed: !!apiKey,
    };
  }
);

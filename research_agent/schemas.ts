import z from 'zod';

export const SummarySchema = z.object({
    summary: z.string().describe('Concise summary of the webpage content'),
    keyExcerpts: z.string().describe('Important quotes and excerpts from the content'),
});

import { tool } from '@langchain/core/tools';
import { getToday, separator, tavilyClient } from '../utils';
import { flashModel } from '../models';
import { SummarySchema } from './schemas';
import { summarizeWebpagePrompt } from './prompts';
import { SystemMessage } from '@langchain/core/messages';
import z from 'zod';

export const tavilySearch = tool(
    async ({ query, topic, maxResults }) => {
        const { results } = await tavilyClient.search(query, {
            topic,
            maxResults,
        });

        const structuredModel = flashModel.withStructuredOutput(SummarySchema);

        const summaries = await Promise.all(
            results.map(async ({ url, title, content: baseContent, rawContent }, i) => {
                let content = baseContent;

                if (!!rawContent) {
                    try {
                        const { summary, keyExcerpts } = await structuredModel.invoke([
                            new SystemMessage(summarizeWebpagePrompt(rawContent, getToday())),
                        ]);

                        content = `
                        <summary>\n${summary}\n</summary>\n
                        <key_excerpts>\n${keyExcerpts}\n</key_excerpts>
                        `;
                    } catch (error) {
                        content =
                            rawContent.length >= 1000
                                ? `${rawContent.slice(0, 1000)}...`
                                : rawContent;
                    }
                }

                return `
                SOURCE ${i}: ${title}\n
                URL: ${url}\n
                SUMMARY: ${content}\n
                ${separator(80)}`;
            }),
        );

        return `'Search results:'${summaries.join('\n')}`;
    },
    {
        name: 'tavilySearch',
        description: `Fetch results from Tavily search API with content summarization.`,
        schema: z.object({
            query: z.string().describe('A single search query to execute'),
            maxResults: z.number().describe('Maximum number of results to return'),
            topic: z
                .literal(['general', 'news', 'finance'])
                .describe("Topic to filter results by ('general', 'news', 'finance')"),
        }),
    },
);

import { tool } from '@langchain/core/tools';
import z from 'zod';
import { getToday, separator, tavilyClient } from './utils';
import { flashModel } from './models';
import { SummarySchema } from './research/schemas';
import { SystemMessage, ToolMessage } from '@langchain/core/messages';
import { summarizeWebpagePrompt } from './research/prompts';

export const think = tool(({ reflection }) => `Reflection recorded: ${reflection}`, {
    name: 'think',
    description: `
    Tool for strategic reflection on research progress and decision-making.

    Use this tool after each search to analyze results and plan next steps systematically.
    This creates a deliberate pause in the research workflow for quality decision-making.

    When to use:
    - After receiving search results: What key information did I find?
    - Before deciding next steps: Do I have enough to answer comprehensively?
    - When assessing research gaps: What specific information am I still missing?
    - Before concluding research: Can I provide a complete answer now?

    Reflection should address:
    1. Analysis of current findings - What concrete information have I gathered?
    2. Gap assessment - What crucial information is still missing?
    3. Quality evaluation - Do I have sufficient evidence/examples for a good answer?
    4. Strategic decision - Should I continue searching or provide my answer?
    `,
    schema: z.object({
        reflection: z
            .string()
            .describe(
                'Your detailed reflection on research progress, findings, gaps, and next steps',
            ),
    }),
});

export const tavilySearch = tool(
    async ({ query, topic, maxResults }, { runId }) => {
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

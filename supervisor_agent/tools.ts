import { tool } from '@langchain/core/tools';
import z from 'zod';
import { researchAgent } from '../research_agent/agent';
import { HumanMessage } from '@langchain/core/messages';

export const delegateResearch = tool(
    async ({ query, researchTopic }) => {
        const { compressedResearch } = await researchAgent.invoke({
            researchMessages: [new HumanMessage(query)],
            researchTopic,
        });

        return compressedResearch;
    },
    {
        name: 'delegateResearch',
        description:
            'Delegates a specific research task to the specialized research agent. Use this tool when you need in-depth information, literature review, or detailed analysis on a particular topic.',
        schema: z.object({
            query: z
                .string()
                .describe(
                    'The specific question or instruction for the research agent to investigate.',
                ),
            researchTopic: z
                .string()
                .describe(
                    'The broader topic or context under which the research is being conducted.',
                ),
        }),
    },
);

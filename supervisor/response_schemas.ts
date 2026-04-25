import z from 'zod';

export const SupervisorResponse = z.xor([
    z.object({
        researchComplete: z
            .literal(true)
            .describe('Boolean for indicating that the research process is complete.'),
    }),
    z.object({
        researchComplete: z
            .literal(false)
            .describe('Boolean for indicating that the research process is complete.'),
        researchTopics: z.array(
            z
                .string()
                .describe(
                    'The topic to research. Should be a single topic, and should be described in high detail (at least a paragraph).',
                ),
        ),
        think: z.boolean().describe('Boolean for indicating if should use the think-tool'),
    }),
]);

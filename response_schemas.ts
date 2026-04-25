import z from 'zod';

export const ClarifyWithUser = z.xor([
    z.object({
        needClarification: z
            .literal(true)
            .describe('Whether the user needs to be asked a clarifying question.'),
        question: z.string().describe('A question to ask the user to clarify the report scope'),
    }),
    z.object({
        needClarification: z
            .literal(false)
            .describe('Whether the user needs to be asked a clarifying question.'),
        verification: z
            .string()
            .describe(
                'Verify message that we will start research after the user has provided the necessary information.',
            ),
    }),
]);

export const ResearchBrief = z.object({
    researchBrief: z
        .string()
        .describe('A research question that will be used to guide the research.'),
});

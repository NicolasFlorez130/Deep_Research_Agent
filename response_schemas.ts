import z from 'zod';

export const ClarifyWithUser = z.object({
    needClarification: z
        .boolean()
        .describe('Whether the user needs to be asked a clarifying question.'),
    question: z
        .string()
        .describe('Acknowledgement message that you will now start research based on the provided information'),
    verification: z
        .string()
        .describe(
            'Your clarifying question',
        ),
});

export const ResearchBrief = z.object({
    researchBrief: z
        .string()
        .describe(
            'A condensed research question that will be used as the milestone to generate the final report',
        ),
    researchBriefs: z
        .array(z.string())
        .describe(
            'A set of questions that will be send to different research supervisors to guide their research.',
        ),
});

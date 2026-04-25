import { AIMessage, getBufferString, HumanMessage, SystemMessage } from '@langchain/core/messages';
import {
    clarifyWithUserInstructions,
    finalReportGenerationPrompt,
    transformMessagesIntoResearchTopicPrompt,
} from './prompts';
import { flashModel, proModel } from './models';
import { ClarifyWithUser, ResearchBrief } from './response_schemas';
import type { IAgentState } from './types/state';
import { Command, END, Send, type GraphNode } from '@langchain/langgraph';
import { getToday } from './utils';

export enum AgentNodes {
    clarifyWithUser = 'clarifyWithUser',
    writeResearchBrief = 'writeResearchBrief',
    supervisor = 'supervisor',
    generateFinalReport = 'generateFinalReport',
}

export const clarifyWithUser: GraphNode<IAgentState> = async ({ messages }) => {
    const structuredModel = flashModel.withStructuredOutput(ClarifyWithUser);

    const response = await structuredModel.invoke([
        new SystemMessage(clarifyWithUserInstructions(getToday())),
        ...messages,
    ]);

    if (response.needClarification) {
        return new Command({
            goto: END,
            update: {
                messages: [new AIMessage(response.verification)],
            },
        });
    } else {
        return new Command({
            goto: AgentNodes.writeResearchBrief,
            update: {
                messages: [new AIMessage(response.question)],
            },
        });
    }
};

export const writeResearchBrief: GraphNode<IAgentState> = async ({ messages }) => {
    const structuredModel = flashModel.withStructuredOutput(ResearchBrief);

    const { researchBriefs, researchBrief } = await structuredModel.invoke([
        new HumanMessage(
            transformMessagesIntoResearchTopicPrompt(getBufferString(messages), getToday()),
        ),
    ]);

    return new Command({
        update: {
            researchBrief,
        },
        goto: researchBriefs
            .filter(({ length }) => !!length)
            .map(brief => new Send(AgentNodes.supervisor, { researchBrief: brief })),
    });
};

export const generateFinalReport: GraphNode<IAgentState> = async ({ researchBrief, notes }) => {
    const { content } = await proModel.invoke([
        new AIMessage(
            finalReportGenerationPrompt(researchBrief, notes?.join('\n') ?? '', getToday()),
        ),
    ]);

    return new Command({
        update: {
            finalReport: content.toString(),
            messages: [new AIMessage(`Here is the final report: ${content}`)],
        },
    });
};

import { AIMessage, getBufferString, HumanMessage, SystemMessage } from '@langchain/core/messages';
import {
    clarifyWithUserInstructions,
    transformMessagesIntoResearchTopicPrompt,
} from '../base_prompts';
import { flashModel } from '../models';
import { ClarifyWithUser, ResearchBrief } from '../response_schemas';
import type { IAgentState } from '../types/state';
import { Command, END, type GraphNode } from '@langchain/langgraph';
import { getToday } from '../utils';
import { AgentNodes } from '..';

export const clarifyWithUser: GraphNode<IAgentState> = async ({ messages }) => {
    const structuredModel = flashModel.withStructuredOutput(ClarifyWithUser);

    const response = await structuredModel.invoke([
        new SystemMessage(clarifyWithUserInstructions(getBufferString(messages), getToday())),
    ]);

    if (response.needClarification) {
        return new Command({
            goto: END,
            update: {
                messages: [new AIMessage(response.question)],
            },
        });
    } else {
        return new Command({
            goto: AgentNodes.writeResearchBrief,
            update: {
                messages: [new AIMessage(response.verification)],
            },
        });
    }
};

export const writeResearchBrief: GraphNode<IAgentState> = async ({ messages }) => {
    const structuredModel = flashModel.withStructuredOutput(ResearchBrief);

    const { researchBrief } = await structuredModel.invoke([
        new SystemMessage(
            transformMessagesIntoResearchTopicPrompt(getBufferString(messages), getToday()),
        ),
    ]);

    return new Command({
        update: {
            researchBrief,
            messages: [new AIMessage(researchBrief)],
        },
    });
};

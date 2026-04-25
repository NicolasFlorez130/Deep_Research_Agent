import type { GraphNode } from '@langchain/langgraph';
import type { IAgentState } from '../types/state';
import { flashModel } from '../models';
import { SystemMessage } from '@langchain/core/messages';
import { leadResearchPrompt } from './prompts';
import { getToday } from '../utils';
import { SupervisorResponse } from './response_schemas';

const supervisorTools = [];

enum SupervisorNodes {
    supervisor = 'supervisor',
}

const maxConcurrentResearchers = 3;
const maxResearcherIterations = 6;

export const supervisor: GraphNode<IAgentState> = async ({ messages }) => {
    const structuredModel = flashModel.withStructuredOutput(SupervisorResponse);
    const response = await structuredModel.invoke([
        new SystemMessage(
            leadResearchPrompt(getToday(), maxConcurrentResearchers, maxResearcherIterations),
        ),
        ...messages,
    ]);

    return {};
};

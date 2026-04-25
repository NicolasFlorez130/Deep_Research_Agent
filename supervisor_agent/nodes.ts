import { Command, END, type GraphNode } from '@langchain/langgraph';
import type { ISupervisorAgentOutput, ISupervisorAgentState } from '../types/state';
import { flashModel } from '../models';
import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { leadResearchPrompt } from './prompts';
import { getToday } from '../utils';
import { invokeTools, think } from '../tools';
import { delegateResearch } from './tools';

export enum SupervisorNodes {
    supervisor = 'supervisor',
    toolCalls = 'toolCalls',
}

const maxConcurrentResearchers = 3;
const maxResearcherIterations = 6;

const tools = [think, delegateResearch];
const toolsByName = Object.fromEntries(tools.map(tool => [tool.name, tool]));

export const supervisor: GraphNode<ISupervisorAgentState> = async ({
    supervisorMessages,
    researchBrief,
}) => {
    const modelWithTools = flashModel.bindTools(tools);
    const response = await modelWithTools.invoke([
        new SystemMessage(
            leadResearchPrompt(getToday(), maxConcurrentResearchers, maxResearcherIterations),
        ),
        new HumanMessage(researchBrief),
        ...supervisorMessages,
    ]);

    if (!!response.tool_calls?.length) {
        return new Command({
            goto: SupervisorNodes.toolCalls,
            update: {
                supervisorMessages: [response],
            },
        });
    } else {
        return new Command<ISupervisorAgentOutput>({
            goto: END,
            update: {
                messages: [new AIMessage(response.content)],
            },
        });
    }
};

export const toolCalls: GraphNode<ISupervisorAgentState> = async ({ supervisorMessages }) => {
    const { tool_calls } = supervisorMessages.at(-1) as AIMessage;

    const observations: string[] = await invokeTools(tool_calls!, toolsByName);

    return new Command({
        update: {
            supervisorMessages: tool_calls!.map(
                ({ id, name }, i) =>
                    new ToolMessage({ content: observations.at(i), tool_call_id: id!, name }),
            ),
            notes: observations,
        },
    });
};

import { Command, END, type GraphNode } from '@langchain/langgraph';
import type { IAgentState } from '../types/state';
import { flashModel } from '../models';
import { AIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
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

export const supervisor: GraphNode<IAgentState> = async ({ messages }) => {
    const modelWithTools = flashModel.bindTools(tools);
    const response = await modelWithTools.invoke([
        new SystemMessage(
            leadResearchPrompt(getToday(), maxConcurrentResearchers, maxResearcherIterations),
        ),
        ...messages,
    ]);

    return new Command({
        goto: !!response.tool_calls?.length ? SupervisorNodes.toolCalls : END,
        update: {
            messages: [response],
        },
    });
};

export const toolCalls: GraphNode<IAgentState> = async ({ messages }) => {
    const { tool_calls } = messages.at(-1) as AIMessage;

    const observations: string[] = await invokeTools(tool_calls!, toolsByName);

    return new Command({
        update: {
            messages: tool_calls!.map(
                ({ id, name }, i) =>
                    new ToolMessage({ content: observations.at(i), tool_call_id: id!, name }),
            ),
            notes: observations,
        },
    });
};

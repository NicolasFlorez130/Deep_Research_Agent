import { Command, type GraphNode } from '@langchain/langgraph';
import { flashModel, proModel } from '../models';
import { invokeTools, think } from '../tools';
import type { IResearchAgentOutput, IResearchAgentState } from '../types/state';
import {
    AIMessage,
    filterMessages,
    HumanMessage,
    SystemMessage,
    ToolMessage,
} from '@langchain/core/messages';
import {
    compressResearchHumanMessage,
    compressResearchPrompt,
    researchAgentPrompt,
} from './prompts';
import { getToday } from '../utils';
import { tavilySearch } from './tools';

export enum ResearchAgentNodes {
    llmCall = 'llmCall',
    toolCalls = 'toolCalls',
    compressResearch = 'compressResearch',
}

const tools = [think, tavilySearch];
const toolsByName = Object.fromEntries(tools.map(tool => [tool.name, tool]));

const modelWithTools = flashModel.bindTools(tools);

export const llmCall: GraphNode<IResearchAgentState> = async ({ messages }) => {
    const response = await modelWithTools.invoke([
        new SystemMessage(researchAgentPrompt(getToday())),
        ...messages,
    ]);

    return new Command({
        update: {
            messages: [response],
        },
        goto: !!response.tool_calls?.length
            ? ResearchAgentNodes.toolCalls
            : ResearchAgentNodes.compressResearch,
    });
};

export const toolCalls: GraphNode<IResearchAgentState> = async ({ messages }) => {
    const { tool_calls } = messages.at(-1) as AIMessage;

    const observations: string[] = await invokeTools(tool_calls!, toolsByName);

    return new Command({
        update: {
            messages: tool_calls!.map(
                ({ id, name }, i) =>
                    new ToolMessage({
                        content: observations.at(i),
                        tool_call_id: id!,
                        name,
                    }),
            ),
        },
    });
};

export const compressResearch: GraphNode<IResearchAgentState> = async ({
    messages,
    researchTopic,
}) => {
    const response = await proModel.invoke([
        new SystemMessage(compressResearchPrompt(getToday())),
        ...messages,
        new HumanMessage(compressResearchHumanMessage(researchTopic)),
    ]);

    const rawNotes = filterMessages(messages, { includeTypes: ['tool', 'ai'] }).map(({ content }) =>
        content.toString(),
    );

    return new Command<IResearchAgentOutput['Update']>({
        update: {
            compressedResearch: response.content.toString(),
            rawNotes,
        },
    });
};

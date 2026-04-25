import { Command, type GraphNode } from '@langchain/langgraph';
import { flashLiteModel, proModel } from '../models';
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

const modelWithTools = flashLiteModel.bindTools(tools);

export const llmCall: GraphNode<IResearchAgentState> = async ({ researchMessages }) => {
    const response = await modelWithTools.invoke([
        new SystemMessage(researchAgentPrompt(getToday())),
        ...researchMessages,
    ]);

    return new Command({
        update: {
            researchMessages: [response],
        },
        goto: !!response.tool_calls?.length
            ? ResearchAgentNodes.toolCalls
            : ResearchAgentNodes.compressResearch,
    });
};

export const toolCalls: GraphNode<IResearchAgentState> = async ({ researchMessages }) => {
    const { tool_calls } = researchMessages.at(-1) as AIMessage;

    const observations: string[] = await invokeTools(tool_calls!, toolsByName);

    return new Command({
        update: {
            researchMessages: tool_calls!.map(
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
    researchMessages,
    researchTopic,
}) => {
    const response = await proModel.invoke([
        new SystemMessage(compressResearchPrompt(getToday())),
        ...researchMessages,
        new HumanMessage(compressResearchHumanMessage(researchTopic)),
    ]);

    const rawNotes = filterMessages(researchMessages, { includeTypes: ['tool', 'ai'] }).map(
        ({ content }) => content.toString(),
    );

    return new Command<IResearchAgentOutput['Update']>({
        update: {
            compressedResearch: response.content.toString(),
            rawNotes,
        },
    });
};

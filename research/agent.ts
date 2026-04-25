import { END, InMemoryStore, START, StateGraph } from '@langchain/langgraph';
import { ResearchAgentState, ResearcherAgentOutput } from './state';
import { compressResearch, llmCall, toolCalls } from './nodes';

export enum ResearchAgentNodes {
    llmCall = 'llmCall',
    toolCalls = 'toolCalls',
    compressResearch = 'compressResearch',
}

const store = new InMemoryStore();

const researchAgentBuilder = new StateGraph(ResearchAgentState, { output: ResearcherAgentOutput })

    .addNode(ResearchAgentNodes.llmCall, llmCall, {
        ends: [ResearchAgentNodes.toolCalls, ResearchAgentNodes.compressResearch],
    })
    .addNode(ResearchAgentNodes.toolCalls, toolCalls)
    .addNode(ResearchAgentNodes.compressResearch, compressResearch)

    .addEdge(START, ResearchAgentNodes.llmCall)
    .addEdge(ResearchAgentNodes.toolCalls, ResearchAgentNodes.llmCall)
    .addEdge(ResearchAgentNodes.compressResearch, END);

export const researchAgent = researchAgentBuilder.compile({ store });

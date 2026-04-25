import { END, START, StateGraph } from '@langchain/langgraph';
import { AgentState } from './state';
import { AgentNodes, clarifyWithUser, generateFinalReport, writeResearchBrief } from './nodes';
import { supervisorAgent } from './supervisor_agent/agent';

const graph = new StateGraph(AgentState)

    .addNode(AgentNodes.clarifyWithUser, clarifyWithUser, {
        ends: [AgentNodes.writeResearchBrief, END],
    })
    .addNode(AgentNodes.writeResearchBrief, writeResearchBrief, { ends: [AgentNodes.supervisor] })
    .addNode(AgentNodes.supervisor, supervisorAgent)
    .addNode(AgentNodes.generateFinalReport, generateFinalReport)

    .addEdge(START, AgentNodes.clarifyWithUser)
    .addEdge(AgentNodes.supervisor, AgentNodes.generateFinalReport)
    .addEdge(AgentNodes.generateFinalReport, END);

export const deepResearchAgent = graph.compile();

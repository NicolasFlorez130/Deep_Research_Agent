import { END, InMemoryStore, START, StateGraph } from '@langchain/langgraph';
import { AgentState } from '../state';
import { supervisor, SupervisorNodes, toolCalls } from './nodes';

const store = new InMemoryStore();

const graph = new StateGraph(AgentState)

    .addNode(SupervisorNodes.supervisor, supervisor, { ends: [SupervisorNodes.toolCalls, END] })
    .addNode(SupervisorNodes.toolCalls, toolCalls)

    .addEdge(START, SupervisorNodes.supervisor)
    .addEdge(SupervisorNodes.toolCalls, SupervisorNodes.supervisor);

export const supervisorAgent = graph.compile({ store });

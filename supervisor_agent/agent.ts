import { END, InMemoryStore, START, StateGraph } from '@langchain/langgraph';
import { supervisor, SupervisorNodes, toolCalls } from './nodes';
import { SupervisorAgentOutput, SupervisorAgentState } from './state';

const store = new InMemoryStore();

const graph = new StateGraph(SupervisorAgentState, { output: SupervisorAgentOutput })

    .addNode(SupervisorNodes.supervisor, supervisor, { ends: [SupervisorNodes.toolCalls, END] })
    .addNode(SupervisorNodes.toolCalls, toolCalls)

    .addEdge(START, SupervisorNodes.supervisor)
    .addEdge(SupervisorNodes.toolCalls, SupervisorNodes.supervisor);

export const supervisorAgent = graph.compile({ store });

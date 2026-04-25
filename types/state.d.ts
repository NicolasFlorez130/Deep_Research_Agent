import type { ResearchAgentState, ResearcherAgentOutput } from '../research_agent/state';
import type { AgentState } from '../state';
import type { SupervisorAgentOutput, SupervisorAgentState } from '../supervisor_agent/state';

export type IAgentState = typeof AgentState;

export type ISupervisorAgentState = typeof SupervisorAgentState;
export type ISupervisorAgentOutput = typeof SupervisorAgentOutput;

export type IResearchAgentState = typeof ResearchAgentState;
export type IResearchAgentOutput = typeof ResearcherAgentOutput;

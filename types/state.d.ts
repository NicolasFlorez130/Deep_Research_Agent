import type { ResearchAgentState, ResearcherAgentOutput } from '../research/state';
import type { AgentState } from '../state';

export type IAgentState = typeof AgentState;

export type IResearchAgentState = typeof ResearchAgentState;
export type IResearchAgentOutput = typeof ResearcherAgentOutput;

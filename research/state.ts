import { Annotation, messagesStateReducer } from '@langchain/langgraph';
import { messages } from '../utils';

export const ResearchAgentState = Annotation.Root({
    messages,
    researchTopic: Annotation<string>,
});

export const ResearcherAgentOutput = Annotation.Root({
    compressedResearch: Annotation<string>,
    rawNotes: Annotation<string[]>,
});

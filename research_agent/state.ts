import { Annotation } from '@langchain/langgraph';
import { messages } from '../utils';

export const ResearchAgentState = Annotation.Root({
    researchMessages: messages,
    researchTopic: Annotation<string>,
});

export const ResearcherAgentOutput = Annotation.Root({
    compressedResearch: Annotation<string>,
    rawNotes: Annotation<string[]>,
});

// export const ResearcherAgentOutput = new StateSchema({
//     compressedResearch: z.string(),
//     rawNotes: z.array(z.string()),
// });

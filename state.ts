import { Annotation } from '@langchain/langgraph';
import { addOperator, messages } from './utils';

export const AgentState = Annotation.Root({
    messages,
    researchBrief: Annotation<string>,
    notes: Annotation<string[] | undefined>({
        reducer: addOperator,
    }),
    finalReport: Annotation<string>,
});

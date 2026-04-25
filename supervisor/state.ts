import { Annotation } from '@langchain/langgraph';
import { addOperator, messages } from '../utils';

export const SupervisorState = Annotation.Root({
    messages,
    researchBrief: Annotation<string>,
    notes: Annotation<string[] | undefined>({
        reducer: addOperator,
    }),
    rawNotes: Annotation<string[] | undefined>({
        reducer: addOperator,
    }),
    researchIterations: Annotation<number>,
});

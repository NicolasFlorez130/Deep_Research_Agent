import { Annotation } from '@langchain/langgraph';
import { addOperator, messages } from '../utils';

export const SupervisorAgentState = Annotation.Root({
    supervisorMessages: messages,
    researchBrief: Annotation<string>,
    notes: Annotation<string[] | undefined>({
        reducer: addOperator,
    }),
});

export const SupervisorAgentOutput = Annotation.Root({
    messages,
    notes: Annotation<string[] | undefined>({
        reducer: addOperator,
    }),
});

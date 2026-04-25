import type { BaseMessage } from '@langchain/core/messages';
import { Annotation, messagesStateReducer } from '@langchain/langgraph';
import { tavily } from '@tavily/core';

export const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

export function addOperator<T>(a: T[] | undefined, b: T[] | undefined) {
    return a?.concat(b ?? []) ?? b;
}

export function getToday() {
    return new Date().toISOString();
}

export const separator = (length: number) =>
    Array.from({ length })
        .map(() => '=')
        .join('');

export const messages = Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => []
});

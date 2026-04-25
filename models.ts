import { ChatGoogle } from '@langchain/google';

export const flashLiteModel = new ChatGoogle('gemini-3.1-flash-lite-preview');
export const flashModel = new ChatGoogle('gemini-3-flash-preview');
export const proModel = new ChatGoogle('gemini-3.1-pro-preview');

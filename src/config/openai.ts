import OpenAI from "openai";

export const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
export const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";

let client: OpenAI | null = null;

export class AiError extends Error {
    status: number;

    constructor(message: string, status = 500) {
        super(message);
        this.status = status;
    }
}

// created lazily so the server still starts when no key is set
export function getOpenAI(): OpenAI {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new AiError("AI service is not configured", 503);
    }

    if (!client) {
        client = new OpenAI({ apiKey });
    }

    return client;
}

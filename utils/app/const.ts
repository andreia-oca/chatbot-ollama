export const DEFAULT_SYSTEM_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT ||
  "";

export const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

export const OPENAI_HOST = process.env.OPENAI_HOST || 'https://api.openai.com';
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

export const DEFAULT_TEMPERATURE = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_TEMPERATURE || "0.2");

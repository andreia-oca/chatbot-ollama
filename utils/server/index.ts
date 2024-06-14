import { s } from 'vitest/dist/env-afee91f0';
import { OLLAMA_HOST } from '../app/const';
import { Pool } from 'pg';

export class OllamaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OllamaError';
  }
}

export const OpenAiStream = async (
  url: string,
  model: string,
  systemPrompt: string,
  temperature: number,
  prompt: string
) => {

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const result = await pool.query(
      'SELECT * FROM system_prompt WHERE agent LIKE $1',
      ['%function_developer%']
    );
    systemPrompt = result.rows[0].prompt;
  } catch (error) {
    console.error('Error executing query', error);
  }

  let promptTemplate = prompt;
  try {
    const result = await pool.query(
      'SELECT * FROM prompts WHERE agent LIKE $1',
      ['%function_developer%']
    );
    promptTemplate = result.rows[0].prompt;
  } catch (error) {
    console.error('Error executing query', error);
  }

  const finalPrompt = promptTemplate.replace('{{feature_description}}', prompt);

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY || ''}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: finalPrompt,
        },
      ],
      temperature: 0.2,
      stream: true,
    }),
  });

  // response to ReadableStream
  const responseStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response.body as any) {
          controller.enqueue(chunk);
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });

  return responseStream;
};


export const OllamaStream = async (
  model: string,
  systemPrompt: string,
  temperature : number,
  prompt: string,
) => {
  let url = `${OLLAMA_HOST}/api/generate`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
    method: 'POST',
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      system: systemPrompt,
      options: {
        temperature: temperature,
      },
    }),
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (res.status !== 200) {
    const result = await res.json();
    if (result.error) {
      throw new OllamaError(
        result.error
      );
    }
  }

  const responseStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of res.body as any) {
          const text = decoder.decode(chunk);
          const parsedData = JSON.parse(text);
          if (parsedData.response) {
            controller.enqueue(encoder.encode(parsedData.response));
          }
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });

  return responseStream;
};

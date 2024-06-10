import { OLLAMA_HOST } from '../app/const';

export class OllamaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OllamaError';
  }
}

export const GenezioPseudoStream = async (
  url: string,
  model: string,
  systemPrompt: string,
  temperature: number,
  prompt: string
) => {
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'GenezioAiService.askFunctionDeveloper',
      params: ["top-secret", prompt, "gpt-4o"],
      id: 3,
    }),
  });

  return await response.json();
};

export const OpenAiStream = async (
  url: string,
  model: string,
  systemPrompt: string,
  temperature: number,
  prompt: string
) => {
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY || ''}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
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

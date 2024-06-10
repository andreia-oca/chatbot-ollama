import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const';
import { GenezioPseudoStream, OllamaError, OllamaStream, OpenAiStream } from '@/utils/server';

import { ChatBody, Message } from '@/types/chat';


export const config = {
  runtime: 'edge',
};
const handler = async (req: Request): Promise<Response> => {
  try {
    const { model, system, options, prompt } = (await req.json()) as ChatBody;

    let promptToSend = system;
    if (!promptToSend) {
      promptToSend = DEFAULT_SYSTEM_PROMPT;
    }

    let temperatureToUse = options?.temperature;
    if (temperatureToUse == null) {
      temperatureToUse = DEFAULT_TEMPERATURE;
    }

    if (model.includes('llama') || model.includes('mistral')) {
      const stream = await OllamaStream(model, promptToSend, temperatureToUse, prompt);
      return new Response(stream);
    }

    if (model.includes('genezio')) {
      const jsonResponse = await GenezioPseudoStream("https://80610373-d10d-4a8f-87f5-83c1bbca4fed.dev-fkt.cloud.genez.io", model, promptToSend, temperatureToUse, prompt);
      // const jsonResponse = ""
      return new Response(JSON.stringify(jsonResponse), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stream = await OpenAiStream("https://api.openai.com/v1/chat/completions", model, promptToSend, temperatureToUse, prompt);
    return new Response(stream);
  } catch (error) {
    console.error(error);
    if (error instanceof OllamaError) {
      return new Response('Error', { status: 500, statusText: error.message });
    } else {
      return new Response('Error', { status: 500 });
    }
  }
};

export default handler;

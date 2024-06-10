import { OLLAMA_HOST } from '@/utils/app/const';
import { OllamaModel } from '@/types/ollama';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    let ollamaModels: OllamaModel[] = [];

    // Fetch Ollama models
    try {
      const ollamaResponse = await fetch(`${OLLAMA_HOST}/api/tags`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (ollamaResponse.status === 200) {
        const json = await ollamaResponse.json();
        ollamaModels = json.models.map((model: any) => ({
          id: model.name,
          name: model.name,
          modified_at: model.modified_at,
          size: model.size,
        })).filter(Boolean);
      } else if (ollamaResponse.status === 401) {
        return new Response(ollamaResponse.body, {
          status: 500,
          headers: ollamaResponse.headers,
        });
      } else {
        console.error(
          `Ollama API returned an error ${
            ollamaResponse.status
          }: ${await ollamaResponse.text()}`
        );
      }
    } catch (error) {
      console.error('Failed to fetch Ollama models', error);
    }

    // Fetch OpenAI models
    const openaiResponse = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (openaiResponse.status !== 200) {
      throw new Error(`OpenAI API returned an error: ${openaiResponse.status}`);
    }

    const openaiJson = await openaiResponse.json();
    const openaiModels = openaiJson.data.map((model: any) => ({
      id: model.id,
      name: model.id,
      created_at: model.created,
    }));

    // Fetch Genezio models
    const genezioResponse = await fetch('https://80610373-d10d-4a8f-87f5-83c1bbca4fed.dev-fkt.cloud.genez.io/', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'GenezioAiService.getModels',
        params: [],
        id: 3,
      }),
    });

    if (genezioResponse.status !== 200) {
      throw new Error(`Genezio API returned an error: ${genezioResponse.status}`);
    }


    const genezioJson = await genezioResponse.json();
    const genezioModels = genezioJson.result.models.map((model: any) => ({
      id: model.id,
      name: model.name,
      created_at: model.created_at,
    }));

    const models = [...ollamaModels, ...openaiModels, ...genezioModels];

    return new Response(JSON.stringify(models), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
};

export default handler;

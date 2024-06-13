import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  try {

    // Fetch OpenAI models
    const openaiResponse = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (openaiResponse.status !== 200) {
      res.status(500).json({ error: `OpenAI API returned an error: ${openaiResponse.status}` });
      return;
    }

    const openaiJson = await openaiResponse.json();
    const openaiModels = openaiJson.data.map((model: any) => ({
      id: model.id,
      name: model.id,
      created_at: model.created,
    }));

    const models = [...openaiModels];

    res.status(200).json(models);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default handler;

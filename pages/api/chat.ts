import { NextApiRequest, NextApiResponse } from 'next';
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const';
import { OpenAiStream } from '@/utils/server';
import { ChatBody } from '@/types/chat';
import { Readable } from 'stream';

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  try {
    const { model, system, options, prompt } = req.body as ChatBody;

    let promptToSend = system || DEFAULT_SYSTEM_PROMPT;
    let temperatureToUse = options?.temperature ?? DEFAULT_TEMPERATURE;

    const readableStream = await OpenAiStream(
      "https://api.openai.com/v1/chat/completions",
      model,
      promptToSend,
      temperatureToUse,
      prompt
    );

    if (readableStream instanceof ReadableStream) {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Transfer-Encoding', 'chunked');

      const reader = readableStream.getReader();
      const nodeStream = new Readable({
        read() {
          reader.read().then(({ done, value }) => {
            if (done) {
              this.push(null);
            } else {
              this.push(value);
            }
          }).catch(err => {
            this.destroy(err);
          });
        }
      });

      nodeStream.pipe(res);
    } else {
      // In case the stream is not a readable stream
      res.status(200).json({ data: readableStream });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default handler;

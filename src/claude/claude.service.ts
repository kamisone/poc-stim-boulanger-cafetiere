import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';

export type ImageMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp';

export interface MessageType {
  role: 'assistant' | 'user';
  content: {
    type: 'text' | 'image';
    text?: string;
    source?: {
      type: 'base64';
      media_type: ImageMimeType;
      data: string;
    };
  }[];
}

const BASIS_MESSAGES = [
  {
    role: 'user',
    content: [
      {
        type: 'text',
        text: `
        When a user sends an image of an appliance, help them troubleshoot why the appliance isn’t working. You will guide the user step by step, asking for confirmation of basic checks first, and then providing symptoms or hypotheses to be confirmed.\n

        Start by sending an approximative name and model of the appliance, then start by sending basic instructions (5 instructions to be confirmed).\n

        The user will send back the instructions that he confirmed, the ones not sent are failed to be verified.\n

        Once the basic checks are confirmed (or denied), you can move on to more specific symptoms or hypotheses to help troubleshoot the appliance (5 symptoms to be confirmed by the user, only symptoms without other explications).\n

        Do not repeat the same propositions/verifications.\n
        
        Language: All communication must be in French. \n

        Always your response must be with this json form: {"title": "the title", "propositions": []}. The final response will be : {"title":  "the faulty element name", "description": "estimated price and a minimal help."}.
                `,
      },
    ],
  },
  {
    role: 'assistant',
    content: [
      {
        type: 'text',
        text: "Sounds good! I'm ready. Please send me the image of the appliance.",
      },
    ],
  },
] as any;

const BEDROCK_MODEL = 'anthropic.claude-3-7-sonnet-20250219-v1:0';
const MAX_TOKENS = 500;

export class ClaudeService {
  private client: AnthropicBedrock;
  private history: {
    [key: string]: MessageType[];
  };

  constructor() {
    this.client = new AnthropicBedrock({
      awsRegion: 'eu-west-3',
    });
  }

  async recognizeProduct(
    imgBuffer: Buffer,
    mimeType: ImageMimeType,
    sessionId: string,
  ) {
    try {
      this.history = { [sessionId]: BASIS_MESSAGES };
      const result = await this.command(
        sessionId,
        'image',
        imgBuffer,
        mimeType,
      );
      console.log(result.content[0]['text']);
      return JSON.parse(result.content[0]['text']);
    } catch (_) {
      console.log('error in recognizeProduct: ', _);
    }
  }

  async command(
    sessionId: string,
    type: 'text' | 'image',
    prompt: Buffer | string,
    mimeType?: ImageMimeType,
  ) {
    if (type === 'text') {
      prompt = `The user confirms theses propositions : ${prompt}`;
      const message: MessageType = {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt as string,
          },
        ],
      };

      // save to history
      if (!this.history || !this.history[sessionId]) {
        throw new BadRequestException('sessionId value not found.');
      }

      this.history[sessionId].push(message);

      const assistantRes = await this.client.messages.create({
        model: 'anthropic.claude-3-haiku-20240307-v1:0',
        max_tokens: MAX_TOKENS,

        messages: [...(this.history[sessionId] as any)],
      });
      this.history[sessionId].push({
        role: assistantRes.role,
        content: assistantRes.content,
      } as MessageType);
      return assistantRes;
    } else if (type === 'image') {
      const message: MessageType = {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: prompt.toString('base64'),
            },
          },
        ],
      };

      // Save to history
      if (!this.history || !this.history[sessionId]) {
        throw new BadRequestException('sessionId value not found.');
      }

      this.history[sessionId].push(message);

      const assistantRes = await this.client.messages.create({
        model: 'anthropic.claude-3-haiku-20240307-v1:0',
        max_tokens: MAX_TOKENS,
        messages: [...(this.history[sessionId] as any)],
      });

      this.history[sessionId].push({
        role: assistantRes.role,
        content: assistantRes.content,
      } as MessageType);
      return assistantRes;
    } else {
      throw new HttpException(
        'Type must be text or image',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

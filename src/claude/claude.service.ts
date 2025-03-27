import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';
import { BadRequestException } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
const sharp = require('sharp');

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

const BEDROCK_MODEL = 'anthropic.claude-3-haiku-20240307-v1:0';
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
      const compressedImgBuffer = await this._compressImage(imgBuffer);
      const ImgBaseBuffer1 = this._getImageBuffer('cafetiere_1.jpg');
      const ImgBaseBuffer2 = this._getImageBuffer('cafetiere_2.jpg');

      this.history = {
        [sessionId]: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: ImgBaseBuffer1.toString('base64'),
                },
              },
              {
                type: 'text',
                text: 'imageUrl: https://boulanger.scene7.com/is/image/Boulanger/8004399334687_h_f_l_0?wid=194&hei=194&resMode=sharp2&op_usm=1.75,0.3,2,0',
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: ImgBaseBuffer2.toString('base64'),
                },
              },
              {
                type: 'text',
                text: 'imageUrl: https://ae01.alicdn.com/kf/HTB12z3fxhuTBuNkHFNRq6A9qpXau.jpg',
              },
              {
                type: 'text',
                text: 'Learn from these uploaded photos, i will ask you in the next.',
              },
            ],
          },

          {
            role: 'assistant',
            content: `Understood, I have carefully saved theses products. I will remember and reference these comprehensive descriptors to efficiently identify and differentiate the various products in the future.`,
          },
        ],
      } as any;

      const message: MessageType = {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: compressedImgBuffer.toString('base64'),
            },
          },
          {
            type: 'text',
            text: `Give the product number that resembles this image uploaded, i want the response to be in this json format: 
            {
                "name": "Approximative title in french",
                "description": "Approximative description in french",
                "price": "Approximative price in euros";
                "imageUrl": "The product image url from descriptive tags list"
            }

            Only one this format, no other details.
            `,
          },
        ],
      };

      // Save to history
      if (!this.history || !this.history[sessionId]) {
        throw new BadRequestException('sessionId value not found.');
      }

      this.history[sessionId].push(message);

      const assistantRes = await this.client.messages.create({
        model: BEDROCK_MODEL,
        max_tokens: MAX_TOKENS,
        messages: this.history[sessionId] as any,
      });

      this.history[sessionId].push({
        role: assistantRes.role,
        content: assistantRes.content,
      } as MessageType);

      return JSON.parse(assistantRes.content[0]['text']);
    } catch (err) {
      console.log('error in recognizeProduct: ', err);
      return {
        success: false,
        error:
          'The provided photo could not be recognized. Please ensure the image is clear and meets the necessary format requirements.',
      };
    }
  }

  async basicVerification(sessionId: string) {
    if (!this.history || !this.history[sessionId]) {
      throw new BadRequestException('sessionId value not found.');
    }
    try {
      const prompt = `Now that you’ve recognized the product the user reported as not working, give me five basic verifications to check in french, in this JSON format (only this format, no other details): {"verifications": []}.`;
      const message: MessageType = {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt as string,
          },
        ],
      };

      this.history[sessionId].push(message);

      const assistantRes = await this.client.messages.create({
        model: BEDROCK_MODEL,
        max_tokens: MAX_TOKENS,

        messages: [...(this.history[sessionId] as any)],
      });
      this.history[sessionId].push({
        role: assistantRes.role,
        content: assistantRes.content,
      } as MessageType);

      return JSON.parse(assistantRes.content[0]['text']);
    } catch (err) {
      this.history[sessionId].pop(); // Take out the last user message
      console.log('error in basicVerification: ', err);
      return {
        success: false,
        error: String(err),
      };
    }
  }

  async symptoms(sessionId: string) {
    if (!this.history || !this.history[sessionId]) {
      throw new BadRequestException('sessionId value not found.');
    }

    try {
      const prompt = `The user has completed all your basic verifications. Now, provide 5 symptoms in french they will confirm, in this JSON format (only this format, no other details): {"symptoms": []}.`;
      const message: MessageType = {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt as string,
          },
        ],
      };

      this.history[sessionId].push(message);

      const assistantRes = await this.client.messages.create({
        model: BEDROCK_MODEL,
        max_tokens: MAX_TOKENS,

        messages: [...(this.history[sessionId] as any)],
      });
      this.history[sessionId].push({
        role: assistantRes.role,
        content: assistantRes.content,
      } as MessageType);

      return JSON.parse(assistantRes.content[0]['text']);
    } catch (err) {
      this.history[sessionId].pop(); // Take out the last user message
      console.log('error in symptoms: ', err);
      return {
        success: false,
        error: String(err),
      };
    }
  }

  async result(sessionId: string, symptoms: string[]) {
    if (!this.history || !this.history[sessionId]) {
      throw new BadRequestException('sessionId value not found.');
    }

    try {
      const prompt = `Here are the symptoms that the user confirmed: 
        ${symptoms.join(', ')} .
        Now, provide the final result in french in this JSON format, without any other details: 
        {   "cause": "",
            difficulty: "dificulty level in french",
            savings: "estimated saving in euros"
            tutorial: "youtube tutorial url"
        }.`;
      const message: MessageType = {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt as string,
          },
        ],
      };

      this.history[sessionId].push(message);

      const assistantRes = await this.client.messages.create({
        model: BEDROCK_MODEL,
        max_tokens: MAX_TOKENS,

        messages: [...(this.history[sessionId] as any)],
      });
      this.history[sessionId].push({
        role: assistantRes.role,
        content: assistantRes.content,
      } as MessageType);

      return JSON.parse(assistantRes.content[0]['text']);
    } catch (err) {
      this.history[sessionId].pop(); // Take out the last user message
      console.log('error in result: ', err);
      return {
        success: false,
        error: String(err),
      };
    }
  }

  async _compressImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      const compressedImage = await sharp(imageBuffer)
        .resize({ width: 1024 })
        .jpeg({ quality: 80 })
        .toBuffer();

      return compressedImage;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw new BadRequestException('Error compressing image.');
    }
  }

  _getImageBuffer(name: string): Buffer {
    const imagePath = join(__dirname, '..', 'images', name);
    try {
      const imageBuffer = readFileSync(imagePath);
      return imageBuffer;
    } catch (error) {
      throw new Error(`Unable to read image: ${error.message}`);
    }
  }
}

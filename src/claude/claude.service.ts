import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
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

const imagesDatabase = [
  {
    url: 'https://boulanger.scene7.com/is/image/Boulanger/8017709280512_h_f_l_0?wid=194&hei=194&resMode=sharp2&op_usm=1.75,0.3,2,0',
    tags: [
      'Smeg (brand)',
      'Espresso machine',
      'Retro/vintage design',
      'Stainless steel accents',
      'Compact/countertop size',
      'Programmable',
      'Control panel with dials/buttons',
      'Pressure gauge',
      'Removable filter holder',
      'Drip tray',
      'Elegant/premium aesthetic',
      'Suitable for home/kitchen use',
      'Coffee preparation',
      'Black color',
      'Brushed metal finishes',
      'Rounded/curved body shape',
      'Sleek, minimalist appearance',
      'Precise temperature and pressure controls',
      'Integrated milk frothing system',
      'LCD/digital display',
      'Automatic shut-off feature',
      'Water level indicator',
      'Corded electric operation',
      'Ergonomic design for ease of use',
    ],
  },
  {
    url: 'https://boulanger.scene7.com/is/image/Boulanger/3497674111489_h_f_l_0?wid=194&hei=194&resMode=sharp2&op_usm=1.75,0.3,2,0',
    tags: [
      'Drip coffee maker',
      'Black and stainless steel color',
      'Carafe/pot design',
      'Simple control panel',
      'Straightforward functionality',
      'Compact countertop size',
      'Glass carafe',
      'Permanent filter',
      'Programmable features',
      'Automatic keep-warm function',
      'Cord storage',
      'Durable construction',
      'Suitable for home/kitchen use',
      'Basic coffee preparation',
      'Rectangular shape',
      'Front-facing control panel',
      'Brew pause feature',
      'Water level indicator',
      'Removable parts for easy cleaning',
      'Non-slip feet',
      'Affordable/budget-friendly price point',
      'Beginner-friendly operation',
      'Classic, utilitarian aesthetic',
    ],
  },
  {
    url: 'https://boulanger.scene7.com/is/image/Boulanger/3497674159238_h_f_l_0?wid=194&hei=194&resMode=sharp2&op_usm=1.75,0.3,2,0',
    tags: [
      'Drip coffee maker',
      'Black and silver color scheme',
      'Carafe/pot design',
      'Simple control panel layout',
      'Straightforward, functional features',
      'Compact, countertop-friendly size',
      'Glass carafe with measurement markings',
      'Permanent, reusable filter',
      'Programmable brewing options',
      'Automatic keep-warm function',
      'Cord storage compartment',
      'Durable, plastic construction',
      'Suitable for home/kitchen use',
      'Classic drip coffee preparation',
      'Rectangular, angular body shape',
      'Front-facing control panel orientation',
      'Brew pause feature for pouring during cycle',
      'Water level indicator window',
      'Removable parts for easy cleaning',
      'Non-slip rubber feet for stability',
      'Affordable, entry-level price point',
      'Straightforward, user-friendly operation',
      'Timeless, understated aesthetic design',
    ],
  },
  {
    url: 'https://boulanger.scene7.com/is/image/Boulanger/3497674162238_h_f_l_0?wid=194&hei=194&resMode=sharp2&op_usm=1.75,0.3,2,0',
    tags: [
      'Drip coffee maker',
      'White and stainless steel color scheme',
      'Classic, traditional design',
      'Carafe/pot brewing system',
      'Simple, straightforward controls',
      'Compact, countertop-friendly size',
      'Glass carafe with measurement markings',
      'Permanent, reusable filter',
      'Programmable brewing settings',
      'Automatic keep-warm function',
      'Cord storage area',
      'Durable, plastic construction',
      'Suitable for home/kitchen use',
      'Standard drip coffee preparation',
      'Rectangular, upright shape',
      'Front-facing control panel layout',
      'Brew pause feature for pouring',
      'Water level indicator window',
      'Removable components for cleaning',
      'Non-slip rubber feet for stability',
      'Affordable, entry-level price point',
      'User-friendly, straightforward operation',
      'Classic, timeless aesthetic appeal',
    ],
  },
  {
    url: 'https://boulanger.scene7.com/is/image/Boulanger/3519280114231_h_f_l_0?wid=194&hei=194&resMode=sharp2&op_usm=1.75,0.3,2,0',
    tags: [
      'Espresso/coffee machine combo',
      'Stainless steel and black color scheme',
      'Sleek, modern design aesthetic',
      'Dual functionality - espresso and drip coffee',
      'Programmable with advanced features',
      'Compact, countertop-friendly footprint',
      'Stainless steel housing and accents',
      'Clear water tank with level indicator',
      'Removable filter basket and portafilter',
      'Adjustable steam wand for milk frothing',
      'Integrated tamping station',
      'Illuminated control panel with digital display',
      'Volumetric dosing for consistent brewing',
      'Automatic cleaning and descaling programs',
      'Separate hot water dispenser',
      'Customizable temperature and strength settings',
      'Simultaneous 1 or 2 cup espresso brewing',
      'Insulated carafe for drip coffee serving',
      'Specialized accessories - tamper, measuring spoon',
      'Premium, professional-grade quality',
      'Suitable for home/kitchen or light commercial use',
      'Versatile, high-performance beverage preparation',
    ],
  },
  {
    url: 'https://boulanger.scene7.com/is/image/Boulanger/8017709344405_h_f_l_0?wid=194&hei=194&resMode=sharp2&op_usm=1.75,0.3,2,0',
    tags: [
      'Smeg (brand)',
      'Espresso machine',
      'Retro/vintage design aesthetic',
      'Powder blue/grey color scheme',
      'Stainless steel accents and trim',
      'Compact, countertop-friendly size',
      'Programmable with advanced features',
      'Analog pressure gauge',
      'Control panel with dials and buttons',
      'Removable filter holder/portafilter',
      'Integrated drip tray',
      'Elegant, premium appearance',
      'Suitable for home/kitchen use',
      'Specialized espresso beverage preparation',
      'Rounded, curved body shape',
      'Sleek, minimalist visual profile',
      'Precise temperature and pressure controls',
      'Automatic shut-off functionality',
      'Water level indicator window',
      'Corded electric operation',
      'Ergonomic design for ease of use',
      'High-quality, durable construction',
    ],
  },
  {
    url: 'https://boulanger.scene7.com/is/image/Boulanger/8017709280499_h_f_l_0?wid=194&hei=194&resMode=sharp2&op_usm=1.75,0.3,2,0',
    tags: [
      'Smeg (brand)',
      'Drip coffee maker',
      'Retro/vintage design aesthetic',
      'Cream/off-white color scheme',
      'Stainless steel accents and trim',
      'Compact, countertop-friendly size',
      'Programmable with basic features',
      'Simple control panel layout',
      'Glass carafe with measurement markings',
      'Permanent, reusable filter basket',
      'Integrated warming plate and tray',
      'Elegant, timeless appearance',
      'Suitable for home/kitchen use',
      'Traditional drip coffee preparation',
      'Rounded, curved body shape',
      'Straightforward, functional design',
      'Automatic keep-warm function',
      'Water level indicator window',
      'Cord storage compartment',
      'Durable, plastic construction',
      'User-friendly, beginner-friendly operation',
      'Classic, understated visual appeal',
    ],
  },
  {
    url: 'https://boulanger.scene7.com/is/image/Boulanger/8017709280529_h_f_l_0?wid=194&hei=194&resMode=sharp2&op_usm=1.75,0.3,2,0',
    tags: [
      'Smeg (brand)',
      'Drip coffee maker',
      'Retro/vintage design aesthetic',
      'Light blue/powder blue color scheme',
      'Stainless steel accents and trim',
      'Compact, countertop-friendly size',
      'Programmable with basic features',
      'Simple, straightforward control panel',
      'Glass carafe with measurement markings',
      'Permanent, reusable filter basket',
      'Integrated warming plate and tray',
      'Elegant, timeless visual appeal',
      'Suitable for home/kitchen use',
      'Traditional drip coffee preparation',
      'Rounded, curved exterior shape',
      'Functional, user-friendly design',
      'Automatic keep-warm function',
      'Water level indicator window',
      'Cord storage compartment',
      'Durable, plastic construction',
      'Beginner-friendly, easy operation',
      'Classic, nostalgic aesthetic charm',
    ],
  },
  {
    url: 'https://boulanger.scene7.com/is/image/Boulanger/8004399329140_h_f_l_0?wid=194&hei=194&resMode=sharp2&op_usm=1.75,0.3,2,0',
    tags: [
      'DeLonghi (brand)',
      'Espresso/coffee machine combo',
      'Classic, traditional design aesthetic',
      'Black and stainless steel color scheme',
      'Compact, countertop-friendly size',
      'Dual functionality - espresso and drip coffee',
      'Control panel with buttons and dials',
      'Portafilter for ground coffee/ESE pods',
      'Integrated milk frothing wand',
      'Removable water tank with level indicator',
      'Drip tray and cup warming surface',
      'Programmable settings and features',
      'Simultaneous 1 or 2 cup espresso brewing',
      'Permanent filter basket and carafe',
      'Automatic shut-off and keep-warm functions',
      'Cord storage compartment',
      'Durable, plastic and metal construction',
      'Versatile, multi-purpose beverage maker',
      'Suitable for home/kitchen or small office use',
      'User-friendly, all-in-one coffee solution',
    ],
  },
  {
    url: 'https://boulanger.scene7.com/is/image/Boulanger/8712072539860_h_f_l_0?wid=194&hei=194&resMode=sharp2&op_usm=1.75,0.3,2,0',
    tags: [
      'Melitta (brand)',
      'Drip coffee maker',
      'Striking, modern visual design',
      'Black, white, and orange color scheme',
      'Compact, space-saving footprint',
      'Thermal carafe for serving/insulation',
      'Cone-shaped filter basket',
      'Removable water reservoir',
      'Programmable brewing functionality',
      'Pause-and-serve capability',
      'Freshness timer and indicator light',
      'Durable, sturdy plastic construction',
      'Sleek, minimalist control panel',
      'Permanent, reusable filter',
      'Automatic keep-warm plate',
      'Cord storage compartment',
      'Versatile, user-friendly features',
      'Suitable for home, office, or small-scale use',
      'High-quality, precision-engineered brewing',
      'Distinctive, contemporary aesthetic appeal',
    ],
  },
];

const INITIAL_MESSAGES = [
  {
    role: 'user',
    content: `List of descriptive tags: \n 
                ${imagesDatabase.map((imgObj, idx) => `product nb ${idx}: ${imgObj.tags.join(', ')} (url: ${imgObj.url}) | \n`)} \n
                I want you to save them and remember them for the future use in image recognition`,
  },
  {
    role: 'assistant',
    content: `Understood, I have carefully saved the detailed product tag lists you provided. I will remember and reference these comprehensive descriptors to efficiently identify and differentiate the various products in the future.`,
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
      const compressedImgBuffer = await this._compressImage(imgBuffer);
      this.history = { [sessionId]: INITIAL_MESSAGES };

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

            Only this format, no other details.
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
        model: 'anthropic.claude-3-haiku-20240307-v1:0',
        max_tokens: MAX_TOKENS,
        messages: this.history[sessionId] as any,
      });

      this.history[sessionId].push({
        role: assistantRes.role,
        content: assistantRes.content,
      } as MessageType);

      return JSON.parse(assistantRes.content[0]['text']);
    } catch (_) {
      console.log('error in recognizeProduct: ', _);
    }
  }

  async basicVerification(sessionId: string) {
    if (!this.history || !this.history[sessionId]) {
      throw new BadRequestException('sessionId value not found.');
    }
    const prompt = `Now that you’ve recognized the product the user reported as not working, give me five basic verifications to check, in this JSON format (only this format, no other details): {"verifications": []}.`;
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
      model: 'anthropic.claude-3-haiku-20240307-v1:0',
      max_tokens: MAX_TOKENS,

      messages: [...(this.history[sessionId] as any)],
    });
    this.history[sessionId].push({
      role: assistantRes.role,
      content: assistantRes.content,
    } as MessageType);

    return JSON.parse(assistantRes.content[0]['text']);
  }

  async symptoms(sessionId: string) {
    if (!this.history || !this.history[sessionId]) {
      throw new BadRequestException('sessionId value not found.');
    }

    const prompt = `The user has completed all your basic verifications. Now, provide 5 symptoms they will confirm, in this JSON format (only this format, no other details): {"symptoms": []}.`;
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
      model: 'anthropic.claude-3-haiku-20240307-v1:0',
      max_tokens: MAX_TOKENS,

      messages: [...(this.history[sessionId] as any)],
    });
    this.history[sessionId].push({
      role: assistantRes.role,
      content: assistantRes.content,
    } as MessageType);

    return JSON.parse(assistantRes.content[0]['text']);
  }

  async result(sessionId: string, symptoms: string[]) {
    if (!this.history || !this.history[sessionId]) {
      throw new BadRequestException('sessionId value not found.');
    }

    const prompt = `Here are the symptoms that the user confirmed: 
        ${symptoms.join(', ')} .
        Now, provide the final result in this JSON format, without any other details: {"result": ""}.`;
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
      model: 'anthropic.claude-3-haiku-20240307-v1:0',
      max_tokens: MAX_TOKENS,

      messages: [...(this.history[sessionId] as any)],
    });
    this.history[sessionId].push({
      role: assistantRes.role,
      content: assistantRes.content,
    } as MessageType);

    return JSON.parse(assistantRes.content[0]['text']);
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
}

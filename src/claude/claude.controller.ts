import {
  BadRequestException,
  Body,
  Controller,
  Injectable,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { File } from 'multer';
import { ClaudeService } from './claude.service';

@Controller('')
export class ClaudeController {
  constructor(private ClaudeService: ClaudeService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  async upload(@Body() body: any, @UploadedFile() file: File) {
    if (!file) {
      throw new BadRequestException('No photo uploaded');
    }
    const imgBuffer = file.buffer;
    const sessionId = String(Math.random() * 10000000);
    const recognizedProduct = await this.ClaudeService.recognizeProduct(
      imgBuffer,
      file.mimetype,
      sessionId,
    );
    // console.log('recognizedProduct: ', recognizedProduct);
    return {
      success: true,
      data: recognizedProduct,
      sessionId,
    };
  }
  @Post('troubleshooting')
  async troubleshooting(
    @Body() body: { response: string[]; sessionId?: string },
  ) {
    if (!body.sessionId) {
      throw new BadRequestException('sessionId is needed.');
    }
    const assistantRes = await this.ClaudeService.command(
      body.sessionId,
      'text',
      body.response.join(' - '),
    );

    return {
      success: true,
      data: assistantRes,
    };
  }
}

import {
  BadRequestException,
  Body,
  Controller,
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

  @Post('upload')
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

    const assistantRes = await this.ClaudeService.basicVerification(
      body.sessionId,
    );

    return {
      success: true,
      data: JSON.parse(assistantRes.content[0]['text']),
    };
  }

  @Post('symptoms')
  async symptoms(@Body() body: { sessionId: string }) {
    if (!body.sessionId) {
      throw new BadRequestException('sessionId is needed.');
    }

    const assistantRes = await this.ClaudeService.symptoms(body.sessionId);

    return {
      success: true,
      data: JSON.parse(assistantRes.content[0]['text']),
    };
  }

  @Post('result')
  async result(@Body() body: { sessionId: string, symptoms: string[] }) {
    if (!body.sessionId) {
      throw new BadRequestException('sessionId is needed.');
    }

    const assistantRes = await this.ClaudeService.result(body.sessionId, body.symptoms);

    return {
      success: true,
      data: JSON.parse(assistantRes.content[0]['text']),
    };
  }
}

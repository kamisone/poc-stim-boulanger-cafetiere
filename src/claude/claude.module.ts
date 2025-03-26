import { Module } from '@nestjs/common';
import { ClaudeService } from './claude.service';
import { ClaudeController } from './claude.controller';

@Module({
  imports: [],
  controllers: [ClaudeController],
  providers: [ClaudeService],
  exports: [],
})
export class ClaudeModule {}

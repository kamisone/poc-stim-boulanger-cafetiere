import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClaudeModule } from './claude/claude.module';

@Module({
  imports: [ClaudeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

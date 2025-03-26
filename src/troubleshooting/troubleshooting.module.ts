import { Module } from '@nestjs/common';
import { TroubleshootingService } from './troubleshooting.service';

@Module({
  imports: [],
  controllers: [],
  providers: [TroubleshootingService],
  exports: [TroubleshootingService],
})
export class TroubleshootingModule {}

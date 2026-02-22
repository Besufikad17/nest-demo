import { Module } from '@nestjs/common';
import { BullBoardService } from './bull-board.service';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

@Module({
  providers: [BullBoardService],
  imports: [
    BullModule.registerQueue({
      name: 'notification',
    }),
    ConfigModule
  ],
  exports: [BullBoardService],
})
export class BullBoardModule { }



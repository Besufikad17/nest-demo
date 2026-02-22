import { Injectable, OnModuleInit } from '@nestjs/common';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { INestApplication } from '@nestjs/common';
import * as basicAuth from 'express-basic-auth';

@Injectable()
export class BullBoardService implements OnModuleInit {
  private readonly serverAdapter = new ExpressAdapter();

  constructor(
    private config: ConfigService,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) { }

  onModuleInit() {
    this.serverAdapter.setBasePath('/admin/queues');

    createBullBoard({
      queues: [
        new BullMQAdapter(this.notificationQueue, { description: 'Sends push notifications' }),
      ],
      serverAdapter: this.serverAdapter,
      options: {
        uiConfig: {
          boardTitle: 'NestJS Bull Board',
        },
      },
    });
  }

  mountTo(app: INestApplication) {
    const expressApp = app.getHttpAdapter().getInstance();

    expressApp.use(
      '/admin/queues',
      basicAuth({
        challenge: true,
        users: { admin: this.config.get('BULLBOARD_PASSWORD')! },
      }),
      this.serverAdapter.getRouter(),
    );
  }
}


import { Injectable, MessageEvent } from '@nestjs/common';
import { DeviceInfo } from 'generated/prisma/client';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class DeviceInfoSessionStreamService {
  private readonly sessionStream = new Subject<MessageEvent>();

  get stream$(): Observable<MessageEvent> {
    return this.sessionStream.asObservable();
  }

  emitSession(session: DeviceInfo) {
    this.sessionStream.next({
      type: 'message',
      data: session,
    });
  }
}
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { INotificationRepository, INotificationService, INotificationResponse } from '../interfaces';


@Injectable()
export class NotificationService implements INotificationService {
  constructor(
    private notificationRepository: INotificationRepository
  ) { }
}

import { Module } from '@nestjs/common';
import { OtpRequestService } from './services/otp-request.service';
import * as Interface from './interfaces';
import { OtpRequestRepository } from './repositories/otp-request.repository';

@Module({
  providers: [
    { provide: Interface.IOtpRequestRepository, useClass: OtpRequestRepository },
    { provide: Interface.IOtpRequestService, useClass: OtpRequestService },
    OtpRequestService
  ],
  exports: [Interface.IOtpRequestRepository, Interface.IOtpRequestService]
})
export class OtpRequestModule { }

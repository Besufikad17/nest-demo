import { RegisterFcmTokenDto } from "../dto/notification.dto";

export interface IFcmTokenResponse {
  message: string;
}

export abstract class IFcmTokenService {
  abstract registerFcmToken(registerFcmTokenDto: RegisterFcmTokenDto, userId: string): Promise<IFcmTokenResponse>;
}

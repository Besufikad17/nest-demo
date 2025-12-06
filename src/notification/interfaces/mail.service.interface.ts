export interface IMailInterface {
  to: string;
  subject: string;
  body?: string;
  html?: string;
}

export abstract class IMailService {
  abstract sendEmail(emailData: IMailInterface): Promise<void>;
}

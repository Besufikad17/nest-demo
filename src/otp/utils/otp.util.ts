import { MESSAGE_TYPE } from "src/notification/enums/notification.enum";

export function getMessageType(otpType: string): MESSAGE_TYPE {
  switch (otpType) {
    case "ACCOUNT_VERIFICATION":
      return MESSAGE_TYPE.ACCOUNT_VERIFICATION;
    case "TWO_FACTOR_AUTHENTICATION":
      return MESSAGE_TYPE.TWO_STEP_VERIFICATION;
    case "ACCOUNT_RECOVERY":
      return MESSAGE_TYPE.ACCOUNT_RECOVERY;
    case "PASSWORD_RESET":
      return MESSAGE_TYPE.PASSWORD_RESET;
  }
}

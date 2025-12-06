export interface IUser {
  id: string;
  email?: string;
  phoneNumber?: string;
  passwordHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  isActive?: boolean;
  accountStatus?: string;
  twoStepEnabled?: boolean;
}

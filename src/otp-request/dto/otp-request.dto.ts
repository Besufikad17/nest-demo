import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateOtpRequestDto {
  @IsNotEmpty()
  readonly value: string;
}

export class GetOtpRequestDto {
  @IsNotEmpty()
  readonly value: string;
}

export class UpdateOtpRequestDto {
  @IsNotEmpty()
  readonly value: string;

  @IsNotEmpty()
  @IsNumber()
  readonly count: number;
}

export class DeleteOtpRequestDto {
  @IsNotEmpty()
  readonly value: string;
}

import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateOTPRequestDto {
  @IsNotEmpty()
  readonly value: string;
}

export class GetOTPRequestDto {
  @IsNotEmpty()
  readonly value: string;
}

export class UpdateOTPRequestDto {
  @IsNotEmpty()
  readonly value: string;

  @IsNotEmpty()
  @IsNumber()
  readonly count: number;
}

export class DeleteOTPRequestDto {
  @IsNotEmpty()
  readonly value: string;
}

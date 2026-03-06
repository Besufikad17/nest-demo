import { ApiProperty } from "@nestjs/swagger";
import { IApiResponse } from "../interfaces";

export class ApiResponse<T> implements IApiResponse<T> {
  @ApiProperty({ description: "Indicates if the request was successful" })
  success: boolean;

  @ApiProperty({ description: "A message providing more details about the response" })
  message: string;

  @ApiProperty({ description: "The data returned by the API, if any", required: false })
  data: T | null;

  @ApiProperty({ description: "Error details if the request was not successful", required: false })
  error: any;

  constructor(success: boolean, message: string, data: T | null, error: any) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
  }
}

export class EmptyBodyResponse {}
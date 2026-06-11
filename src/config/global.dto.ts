import {
  IsBoolean,
  IsEmpty,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class GlobalDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  createdby?: string;

  @IsString()
  @IsEmpty()
  @IsOptional()
  createdon?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  updatedby?: string;

  @IsString()
  @IsOptional()
  updatedon?: string;

  @IsString()
  @IsEmpty()
  @IsOptional()
  deletedby?: string;

  @IsString()
  @IsEmpty()
  @IsOptional()
  deletedon?: string;
}

export class SuccessResponseDto {
  @IsString()
  data!: [];

  @IsBoolean()
  status!: boolean;

  @IsNumber()
  statuscode!: number;

  @IsString()
  message!: string;
}

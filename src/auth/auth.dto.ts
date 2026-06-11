import { IsDate, IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "test@tets.com",
    description: "The identifiant of application",
  })
  username!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "Azerty2023",
    description: "The identifiant of application",
  })
  password!: string;
}

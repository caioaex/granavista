import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";


export class CreateUserDTO {
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/)
  password!: string

  @IsString()
  @IsOptional()
  name?: string
}
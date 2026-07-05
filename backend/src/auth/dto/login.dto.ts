import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'jane@company.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string = '';

  @ApiProperty({ example: 'StrongPass123' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string = '';

  constructor() {
    this.email = '';
    this.password = '';
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, MinLength, MaxLength } from 'class-validator';
import { UserTypes } from '../constant/userType.constant';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email',
    type: () => String,
    example: 'macvantan@gmail.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Name',
    type: () => String,
    example: 'Mac Van Tan',
    required: true,
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Password',
    type: () => String,
    example: '123456',
    required: true,
  })
  @MinLength(6)
  @MaxLength(30)
  password: string;
}

export class CreateUserResDto {
  @ApiProperty({
    description: '_id',
    type: () => String,
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Email',
    type: () => String,
    example: 'macvantan@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'Name',
    type: () => String,
    example: 'Mac Van Tan',
  })
  name: string;

  @ApiProperty({
    description: 'Roles',
    type: () => String,
    example: UserTypes.USER,
  })
  roles: string;

  @ApiProperty({
    description: 'Created at',
    type: () => String,
    example: '2020-11-29T19:46:57.199Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Updated at',
    type: () => String,
    example: '2020-11-29T19:46:57.199Z',
  })
  updatedAt: string;
}

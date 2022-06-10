import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, MinLength, MaxLength } from 'class-validator';
import { UserTypes } from '../constant/userType.constant';

export class LoginUserDto {
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
    description: 'Password',
    type: () => String,
    example: '123456',
    required: true,
  })
  @MinLength(6)
  @MaxLength(30)
  password: string;
}

export class LoginUserResDto {
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
    description: 'Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaW...',
    type: () => String,
  })
  token: string;

  @ApiProperty({
    description: 'Expire token by second',
    example: 25200,
    type: () => Number,
  })
  expire: number;

  @ApiProperty({
    description: 'Refresh token',
    example: '62a29cb16a4f2ed5b0300bce',
    type: () => String,
  })
  refresh_token: string;

  @ApiProperty({
    description: 'Expire refresh token by second',
    example: 604800,
    type: () => Number,
  })
  expireRefreshToken: number;

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

export class ProfileUserDto extends PickType(LoginUserResDto, [
  '_id',
  'email',
  'name',
  'roles',
  'createdAt',
  'updatedAt',
] as const) {}

import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { MaxLength, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { IsObjectId } from 'class-validator-mongo-object-id';
import { UserTypes } from '../constant/userType.constant';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UpdateUserPasswordDto extends PickType(CreateUserDto, [
  'password',
] as const) {
  @ApiProperty({
    description: 'Password',
    type: () => String,
    example: '123456',
    required: true,
  })
  @MinLength(6)
  @MaxLength(30)
  oldPassword: string;
}

export class UpdateUserRolesDto {
  @ApiProperty({
    description: 'User id',
    type: () => String,
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @IsObjectId()
  userId: string;

  @ApiProperty({
    description: 'New roles',
    type: () => String,
    enum: UserTypes,
    example: UserTypes.ADMIN,
    required: true,
  })
  roles: string;
}

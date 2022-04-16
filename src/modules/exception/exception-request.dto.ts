import { ApiProperty, PartialType } from '@nestjs/swagger';

export class ExceptionResDto {
  constructor(statusCode: number, message: string) {
    this.statusCode = statusCode;
    this.message = message;
  }

  @ApiProperty({
    description: 'Status code',
    type: () => Number,
    example: 500,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Message',
    type: () => String,
    example: 'Internal server error',
  })
  message: string;
}

export class BadRequestExceptionResDto extends PartialType(ExceptionResDto) {
  @ApiProperty({
    description: 'Status code',
    type: () => Number,
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Message',
    type: () => String,
    example: 'Email or password is incorrect',
  })
  message: string;
}

export class UnauthorizedExceptionResDto extends PartialType(ExceptionResDto) {
  @ApiProperty({
    description: 'Status code',
    type: () => Number,
    example: 401,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Message',
    type: () => String,
    example: 'Unauthorized',
  })
  message: string;
}

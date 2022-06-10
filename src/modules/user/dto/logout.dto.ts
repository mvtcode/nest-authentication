import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LogoutReqDto {
  @ApiProperty({
    description: 'Refresh token',
    type: () => String,
    example: '6254fd85cb84c9a85ea5274d',
    required: true,
  })
  @IsNotEmpty()
  refreshToken: string;
}

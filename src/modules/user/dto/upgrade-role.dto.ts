import { ApiProperty } from '@nestjs/swagger';
import { UserTypes } from '../constant/userType.constant';

export class UpgradeUserRolesDto {
  @ApiProperty({
    description: 'Upgrade role',
    type: () => String,
    enum: UserTypes,
    example: UserTypes.ADMIN,
    required: true,
  })
  roles: string;
}

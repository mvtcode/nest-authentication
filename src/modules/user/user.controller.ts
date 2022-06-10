import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  HttpStatus,
  Inject,
  CACHE_MANAGER,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { Cache } from 'cache-manager';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../decorators/roles.decorator';
import { comparePassword } from '../../libs/utils';
import {
  BadRequestExceptionResDto,
  ExceptionResDto,
  UnauthorizedExceptionResDto,
} from '../exception/exception-request.dto';
import { UserService } from './user.service';
import { CreateUserDto, CreateUserResDto } from './dto/create-user.dto';
import {
  UpdateUserPasswordDto,
  UpdateUserRolesDto,
} from './dto/update-user.dto';
import {
  LoginUserDto,
  LoginUserResDto,
  ProfileUserDto,
} from './dto/login-user.dto';
import { parseJson } from '../../libs/parse';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutReqDto } from './dto/logout.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuccessResDto } from './dto/success.dto';
import { UserTypes } from './constant/userType.constant';
import { SearchUserReqDto, SearchUserResDto } from './dto/search.dto';
import { UpgradeUserRolesDto } from './dto/upgrade-role.dto';

const expToken = parseInt(process.env.JWT_EXPIRE);
const refreshTokenExp = parseInt(process.env.REFRESH_TOKEN_EXPIRE);

@ApiTags('user')
@Controller('user')
export class UserController {
  private defaultFields = {
    _id: 1,
    email: 1,
    name: 1,
    roles: 1,
    createdAt: 1,
    updatedAt: 1,
  };

  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  @ApiOperation({
    operationId: 'list-user',
    description: 'List user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => SearchUserResDto,
    description: 'List user response',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: () => UnauthorizedExceptionResDto,
    description: 'Unauthorized',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(UserTypes.ADMIN, UserTypes.SUPPER_ADMIN)
  @Get('')
  async list(@Query() request: SearchUserReqDto) {
    return this.userService.search(request, this.defaultFields);
  }

  @ApiOperation({
    operationId: 'user-create',
    description: 'Create new user',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: () => BadRequestExceptionResDto,
    description: 'Exception bad request',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: () => ExceptionResDto,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => CreateUserResDto,
    description: 'New user created response',
  })
  @Post()
  async create(@Body() body: CreateUserDto) {
    const isExited = await this.userService.count({
      email: body.email,
    });

    if (isExited) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Email is existed',
      });
    }

    return this.userService.create(body);
  }

  @ApiOperation({
    operationId: 'user-login',
    description: 'User login',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: () => BadRequestExceptionResDto,
    description: 'Exception bad request',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: () => LoginUserResDto,
    description: 'Login response',
  })
  @Post('login')
  async login(@Body() body: LoginUserDto) {
    const user = await this.userService.findOne(
      {
        email: body.email,
      },
      {
        _id: 1,
        email: 1,
        name: 1,
        password: 1,
        roles: 1,
      },
    );

    if (!user) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Incorect email or password',
      });
    }

    if (!(await comparePassword(body.password, user.password))) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Incorect email or password',
      });
    }

    const { password, ...dataSign } = user;

    const refreshToken = new Types.ObjectId().toString();
    await this.cache.set(refreshToken, JSON.stringify(dataSign), {
      ttl: refreshTokenExp,
    });

    return {
      ...dataSign,
      token: this.jwtService.sign(dataSign),
      expire: process.env.JWT_EXPIRE,
      refreshToken,
      expireRefreshToken: refreshTokenExp,
    };
  }

  @ApiOperation({
    operationId: 'user-logout',
    description: 'User logout',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: () => SuccessResDto,
    description: 'Logout response',
  })
  @Post('logout')
  async logout(@Body() request: LogoutReqDto) {
    await this.cache.del(request.refreshToken);
    return {
      isSuccess: true,
    };
  }

  @ApiOperation({
    operationId: 'user-refresh-token',
    description: 'Refresh token',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: () => BadRequestExceptionResDto,
    description: 'Exception bad request',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: () => LoginUserResDto,
    description: 'Refresh token response',
  })
  @Post('refesh-token')
  async refeshToken(@Body() request: RefreshTokenDto) {
    const dataCache = await this.cache.get(request.refreshToken);

    if (!dataCache) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Incorrect refresh token',
      });
    }

    const dataSign = parseJson(dataCache as string);

    return {
      ...dataSign,
      token: this.jwtService.sign(dataSign),
      expire: expToken,
      refreshToken: request.refreshToken,
    };
  }

  @ApiOperation({
    operationId: 'user-detail',
    description: 'Get profile of current user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => ProfileUserDto,
    description: 'User response',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: () => UnauthorizedExceptionResDto,
    description: 'Unauthorized',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  findOne(@Request() req) {
    const user = req.user;
    return this.userService.findOne({ _id: user._id }, this.defaultFields);
  }

  @ApiOperation({
    operationId: 'change-password',
    description: 'Change password current user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => SuccessResDto,
    description: 'Is success response',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: () => UnauthorizedExceptionResDto,
    description: 'Unauthorized',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async updatePassword(@Request() req, @Body() body: UpdateUserPasswordDto) {
    const user = req.user;

    if (body.oldPassword === body.password) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Unacceptable action, old password is not equal password',
      });
    }

    const info = await this.userService.findOne(
      {
        _id: user._id,
      },
      {
        _id: 1,
        password: 1,
      },
    );

    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found',
      });
    }

    if (!(await comparePassword(body.oldPassword, info.password))) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Old password is not match',
      });
    }

    return {
      isSuccess: await this.userService.updatePassword(user._id, body),
    };
  }

  @ApiOperation({
    operationId: 'roles',
    description: 'Update roles, request role: ADMIN, SUPPER_ADMIN',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => SuccessResDto,
    description: 'Is success response',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: () => UnauthorizedExceptionResDto,
    description: 'Unauthorized',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(UserTypes.ADMIN, UserTypes.SUPPER_ADMIN)
  @Patch('role')
  async updateRoles(@Body() body: UpdateUserRolesDto) {
    return {
      isSuccess: await this.userService.updateRoles(body.userId, body.roles),
    };
  }

  @ApiOperation({
    operationId: 'upgrade-role',
    description: 'Upgrade role for test',
    deprecated: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => SuccessResDto,
    description: 'Is success response',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: () => UnauthorizedExceptionResDto,
    description: 'Unauthorized',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('role-upgrade')
  async upgradeRoles(@Req() req, @Body() body: UpgradeUserRolesDto) {
    const user = req.user;
    return {
      isSuccess: await this.userService.updateRoles(user._id, body.roles),
    };
  }

  @ApiOperation({
    operationId: 'user-delete',
    description: 'Delete user, request role: ADMIN, SUPPER_ADMIN',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => SuccessResDto,
    description: 'Is success response',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: () => UnauthorizedExceptionResDto,
    description: 'Unauthorized',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(UserTypes.ADMIN, UserTypes.SUPPER_ADMIN)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const user = req.user;
    if (user._id === id) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Cannot delete your self',
      });
    }

    return {
      isSuccess: await this.userService.remove(id),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { comparePassword } from 'src/libs/utils';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(request: LoginUserDto): Promise<any> {
    const user = await this.userService.findOne({
      email: request.email,
    }, {
      _id: 1,
      email: 1,
      password: 1,
    });

    if (!user) {
      return null;
    }

    if (!await comparePassword(request.password, user.password)) {
      return null;
    }

    return {
      _id: user._id,
      email: user.email,
    }
  }

  async login(user: any) {
    console.log(user);
    const payload = { email: user.email, _id: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
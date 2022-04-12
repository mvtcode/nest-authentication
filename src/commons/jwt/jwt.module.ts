import { Module } from '@nestjs/common';
import { JwtModule as JWT } from '@nestjs/jwt';

@Module({
  imports: [
    JWT.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: `${process.env.JWT_EXPIRE}s`,
      },
    }),
  ],
  exports: [
    JWT,
  ]
})
export class JwtModule {}

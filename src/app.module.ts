import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { MongoModule } from './commons/mongo/mongo.module';

@Module({
  imports: [MongoModule, UserModule],
})
export class AppModule {}

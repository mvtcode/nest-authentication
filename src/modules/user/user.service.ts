import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cache } from 'cache-manager';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { getKeyUserInfoById } from './constant/keyCache.constant';
import { parseJson } from '../../libs/parse';
import { hashPassword } from '../../libs/utils';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async create(request: CreateUserDto) {
    if (request.password) {
      request.password = await hashPassword(request.password);
    }
    const user = new this.userModel(request);
    await user.save();
    const { password, ...userRes } = user.toJSON();
    return userRes;
  }

  findAll(fields: any = {}): Promise<User[]> {
    const query = this.userModel.find();
    if (Object.keys(fields).length > 0) {
      query.select(fields);
    }

    return query.exec();
  }

  async findOne(where: any = {}, fields: any = {}): Promise<User> {
    if (where._id && typeof where._id === 'string') {
      where._id = new Types.ObjectId(where._id);
    }
    const query = this.userModel.findOne(where);
    if (Object.keys(fields).length > 0) {
      query.select(fields);
    }

    const user = await query.exec();
    if (user) {
      return user.toObject();
    }
    return null;
  }

  async findOneById(id: string, fields: any = {}): Promise<User> {
    const key = getKeyUserInfoById(id);

    const dataCache = (await this.cache.get(key)) as string;
    if (dataCache) {
      return parseJson(dataCache) as User;
    }

    const user = await this.userModel
      .findOne({
        _id: new Types.ObjectId(id),
      })
      .select(fields);

    if (!user) {
      return null;
    }

    const info = user.toObject();
    await this.cache.set(key, JSON.stringify(info), { ttl: 30 });
    return info;
  }

  async count(where: any = {}): Promise<number> {
    return this.userModel.count(where);
  }

  async updatePassword(
    id: string,
    request: UpdateUserPasswordDto,
  ): Promise<boolean> {
    const results = await this.userModel.updateOne(
      {
        _id: new Types.ObjectId(id),
      },
      {
        $set: {
          password: await hashPassword(request.password),
        },
      },
    );

    await this.cache.del(getKeyUserInfoById(id));

    return results.matchedCount > 0;
  }

  async updateRoles(id: string, roles: string): Promise<boolean> {
    const results = await this.userModel.updateOne(
      {
        _id: new Types.ObjectId(id),
      },
      {
        $set: {
          roles,
        },
      },
    );

    await this.cache.del(getKeyUserInfoById(id));

    return results.matchedCount > 0;
  }

  async remove(id: string): Promise<boolean> {
    const results = await this.userModel.deleteOne({
      _id: new Types.ObjectId(id),
    });

    await this.cache.del(getKeyUserInfoById(id));
    return results.deletedCount > 0;
  }
}

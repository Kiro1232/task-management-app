import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(email: string, password: string, name: string): Promise<UserDocument> {
    // Check for duplicate email before hashing (avoids wasted bcrypt computation)
    const existing = await this.userModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    // bcrypt cost factor 12 — strong protection against brute-force attacks
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new this.userModel({ email, password: hashedPassword, name });
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    // Explicitly select password (excluded by schema default via select: false)
    return this.userModel.findOne({ email: email.toLowerCase() }).select('+password').exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }
}

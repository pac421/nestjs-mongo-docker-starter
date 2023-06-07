import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from './schemas/user.schema'
import { genSalt, hash } from 'bcrypt'

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>
    ) {}

    async onModuleInit(): Promise<void> {
        const adminUser = await this.findOne(process.env.APP_ADMIN_USER)
        if (!adminUser) {
            await this.create(process.env.APP_ADMIN_USER, process.env.APP_ADMIN_PW)
        }
    }

    async create(username, password): Promise<User> {
        const salt = await genSalt()
        const hashedPassword = await hash(password, salt)
        const createdUser = await this.userModel.create({
            username,
            password: hashedPassword,
            isTwoFactorAuthenticationEnabled: false,
        })
        return createdUser
    }

    async findOne(username: string): Promise<User | undefined> {
        return await this.userModel.findOne({ username }).exec()
    }

    async setTwoFactorAuthenticationSecret(secret: string, username: string) {
        await this.userModel
            .updateOne({ username }, { twoFactorAuthenticationSecret: secret })
            .exec()
    }

    async turnOnTwoFactorAuthentication(username: string) {
        await this.userModel
            .updateOne({ username }, { isTwoFactorAuthenticationEnabled: true })
            .exec()
    }

    async findAll(): Promise<{ users: User[]; count: number }> {
        const findQuery = this.userModel.find()
        const users = await findQuery
        const count = await this.userModel.count()
        return { users, count }
    }
}

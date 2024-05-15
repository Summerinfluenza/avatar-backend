//import { Inject,  forwardRef } from '@nestjs/common';
import {   Injectable} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './user.dto';
import * as bcrypt from 'bcrypt';
import { AdminManager } from './admin';
import { SurveyService } from 'src/survey/survey.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class UserService {
    public readonly admin;
    

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private surveyServce: SurveyService,
        private readonly emailservice: EmailService
    ) {
        this.admin = new AdminManager(this);
    }

    //Hashes the password string.
    async hash(passwordPlain: string): Promise<string> {
        return await bcrypt.hash(passwordPlain, 10);
    }

    //Creates a new user.
    async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        createUserDto.password = hashedPassword;

        const createdUser = new this.userModel(createUserDto);
        return createdUser.save();
    }

    async getUser(query: object): Promise<UserDocument> {
        return this.userModel.findOne(query);
    }

    async update(id: string, userData: object): Promise<UserDocument> {
        return this.userModel.findByIdAndUpdate(id, userData, { new: true });
    }

    async updateByEmail(email: string, data: object): Promise<UserDocument> {
        return this.userModel.findOneAndUpdate({ email: email }, data, {
            new: true,
        });
    }

    // TODO test this
    async findAllUserIds(): Promise<string[]> {
        return (await this.userModel.find({})).map((user) => user.id);
    }
    
    // TODO test this
    async deleteUser(userid: string) {
        this.userModel.findOneAndDelete({ _id: userid });
        this.surveyServce.deleteSurveysFromUser(userid);
    }

    //Resets user password through email.
    async resetPassword(email: string): Promise<string> {
        const user = await this.getUser({ email: email }) ?? null;
        if (user) {
            let newPassword = this.generatePassword();
            
            //Sends email to the defined email address.
            const reset = await this.emailservice.sendEmail(email, "Password reset", `Here's your new password: ${newPassword}`);

            //Hashes the newly created password and saves it.
            newPassword = await this.hash(newPassword);
            await this.userModel.findOneAndUpdate({ email: email }, {password: newPassword});
            return "Password has been reset successfully.";
        } else {
            return "This email is not registered.";
        }
    }

    //Generates a new password.
    generatePassword() {
        return Math.random().toString(16).slice(2);
    }

   
    
}

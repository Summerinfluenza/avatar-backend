import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SurveySchema } from './survey.schema';
import { SurveyService } from './survey.service';
import { SurveyController } from './survey.controller';
import { User, UserSchema } from 'src/auth/user.schema';
import { ResponseSchema } from "../response/response.schema";

 
 @Module({
    imports: [
      MongooseModule.forFeature([{ name: "survey", schema: SurveySchema  }, 
         { name: "response", schema: ResponseSchema }, 
         { name: User.name, schema: UserSchema }])],
    providers: [SurveyService],
    controllers: [SurveyController],
    exports: [SurveyService]
 })

 export class SurveyModule{} 
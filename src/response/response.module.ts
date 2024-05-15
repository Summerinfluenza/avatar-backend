import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseSchema } from './response.schema';
import { ResponseService } from './response.service';
import { ResponseController } from './response.controller';
import { SurveySchema } from 'src/survey/survey.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [MongooseModule.forFeature([{ name: "response", schema: ResponseSchema }, { name: "survey", schema: SurveySchema }]), HttpModule] ,
    providers: [ResponseService],
    controllers: [ResponseController],
    exports: [ResponseService]
})

export class ResponseModule{}

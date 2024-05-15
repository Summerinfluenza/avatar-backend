import {  Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Survey, SurveyDocument } from './survey.schema';
import { User, UserDocument } from 'src/auth/user.schema';
import { Response } from '../response/response.schema';
import * as AdmZip from 'adm-zip';

@Injectable()
export class SurveyService {
    constructor(
        @InjectModel('survey') private readonly surveyModel: Model<Survey>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel('response') private readonly responseModel: Model<Response>,
    ) { }

    async createSurvey(
        userId: string,
        survey: Partial<Survey>,
    ): Promise<Survey> {
        const currentDate = new Date();
        survey.userId = userId;
        survey.createdAt = currentDate;
        survey.updatedAt = currentDate;
        
        try {
            return this.surveyModel.create(survey);
        } catch (Error) {
            throw new InternalServerErrorException('Internal Server Error');
        }
    }

    async findAll(userId: string): Promise<Survey[]> {
        try {
            return this.surveyModel.find({ userId: userId }).exec();
        } catch (Error) {
            throw new InternalServerErrorException('Internal Server Error');
        }
    }

    async updateSurvey(
        userId: string,
        _id: string,
        updates: Partial<Survey>,
    ): Promise<SurveyDocument> {
        try {
            const survey = await this.findOne({ _id: _id, userId: userId });
            //Checks if the survey is activated, or if it's the activate button being updated.
            if ('activated' in updates) {
                updates['updatedAt'] = new Date();
                return this.surveyModel.findByIdAndUpdate(survey._id, updates, {
                    new: true,
                });
            } else if (survey.activated) {
                return null;
            } else {
                updates['updatedAt'] = new Date();
                return this.surveyModel.findByIdAndUpdate(survey._id, updates, {
                    new: true,
                });
            }
        } catch (Error) {
            throw new InternalServerErrorException('Internal Server Error');
        } 
    }

    async findOne(query: object): Promise<SurveyDocument> {
        try {
            return this.surveyModel.findOne(query).exec();
        } catch (Error) {
            throw new InternalServerErrorException('Internal Server Error');
        }
        
    }

    // Deletes a survey and corresponding responses.
    async deleteSurvey(query: object): Promise<Survey> | null {
        const surveyId = query["_id"];
        try {
            await this.responseModel.deleteMany({ "surveyId": surveyId}).exec();
            return this.surveyModel.findOneAndDelete(surveyId).exec();
        } catch (Error) {
            throw new InternalServerErrorException('Internal Server Error');
        }
    }

    async deleteSurveys(query: object) {
        
        try {
            await this.surveyModel.deleteMany(query["_id"]).exec();
            return { message: 'Survey deleted successfully' };
        } catch (Error) {
            throw new InternalServerErrorException('Internal Server Error');
        }
    }

    //Deletes surveys by associated UserId.
    async deleteSurveysFromUser(userid: string) {
        
        try {
            await this.surveyModel.deleteMany({ userId: userid }).exec();
            return { message: 'Survey deleted from user successfully' };
        } catch (Error) {
            throw new InternalServerErrorException('Internal Server Error');
        }
        
    }

    async find(query: object) {
        return this.surveyModel.find(query);
    }
    
    //Downloads a survey and corresponding responses as a zip file.
    async downloadSurvey(query: object) {
        let counter = 1;

        //Construcs a zip folder.
        const zip = new AdmZip();

        //Finds the survey.
        const survey = await this.findOne(query);
        if (!survey) {
            throw new InternalServerErrorException('Survey not found');
        }
        const iterations = parseInt(String(survey.parameters.maxIterations));
        const quantity = parseInt(String(survey.parameters.avatarsPerPage));

        //Adds survey to the folder.
        zip.addFile("survey.json", JSON.stringify(survey, null, 2));

        //Finds all the corresponding responses.
        const responses = await this.responseModel.find({ surveyId: survey._id })

        responses.forEach((response) => {
            const file = JSON.parse(JSON.stringify(response));
            const buffers = file.generatedImageBatch;
            delete file.generatedImageBatch;

            //Creates a folder for each response and saves the response.json.
            zip.addFile(`response${counter}/response${counter}.json`, JSON.stringify(file, null, 2));

            //Creates a separate folder for each all images.
            let imageCounter = 1;
            buffers.forEach((buffer) => {
                const image = Buffer.from(buffer, 'base64')
                let imageName = `image${imageCounter}.png`
                if (imageCounter > (quantity * iterations)) {
                    imageName = "result.png";
                }

                zip.addFile(`response${counter}/images/${imageName}`, image);
                imageCounter +=1;
            })

            counter += 1;
        })
        
        return zip.toBuffer();
    }

}

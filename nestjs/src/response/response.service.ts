import { InjectModel } from "@nestjs/mongoose";
import { StreamableFile, InternalServerErrorException} from '@nestjs/common';
import { Model } from "mongoose";
import { Survey } from '../survey/survey.schema';
import { Response } from "./response.schema";
import { HttpService } from '@nestjs/axios';
import * as base64 from 'base64-js';

export class ResponseService {

    constructor(
        @InjectModel('response') private readonly responseModel: Model<Response>,
        @InjectModel('survey') private readonly surveyModel: Model<Survey>,
        private readonly httpService: HttpService

    ) { }


    // Creates a response formula based on the survey
    async createResponse(
        surveyId: string,
        response: Partial<Response>,
    ): Promise<any> {

        const survey = await this.surveyModel.findOne({_id: surveyId});
        //Checks if the survey is valid and activated.
        if (!survey) {
            return { message: `The survey with ID ${surveyId} doesn't exist.`, statusCode: 403 };
        } else if (survey[0]["activated"] === false) {
            return { message: `The survey with ID ${surveyId} is closed.`, statusCode: 403 };
        }
        
        response.surveyId = surveyId;
        
        //Checks if the newly generated responseId is unique, otherwise generate a new.
        do {
            response.responseId = this.generateResponseId();
        }
        while(!(await this.findOne({_id: response.responseId})));

        response._id = response.responseId;
        response.createdAt = new Date();

        await this.responseModel.create(response);
        return { message: 'Response created succesfully', "responseid": response.responseId }
        
    }

    //Generates a unique responseId string.
    generateResponseId() {
        return "responseid" + Math.random().toString(16).slice(2);
    }

    //Finds a response by match. Example: {_id: id}.
    async findOne(query: object): Promise<Response> {

        try {
            return await this.responseModel.findOne(query).exec();
        } catch (error) {
            throw new InternalServerErrorException('Internal Server Error');
        }
    }

    //Logs prompt string iteration by responseId.
    async logPromptstring(responseId: string, promptString: string): Promise <Response> {

        try {
            return await this.responseModel.findOneAndUpdate(
                { responseId: responseId },
                { $push: { promptStrings: promptString }, }
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException('Internal Server Error');
        }
    }

    //Logs image buffer iteration by responseId.
    async logBuffer(responseId: string, generatedImageBatch: Buffer): Promise <Response> {

        try {
            return await this.responseModel.findOneAndUpdate(
                { responseId: responseId },
                { $push: { generatedImageBatch: generatedImageBatch }, }
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException('Internal Server Error');
        }
    }

    //Logs rating iteration by responseId.
    async logRatings(responseId: string, ratings: any): Promise <Response> {

        try {
            return await this.responseModel.findOneAndUpdate(
                { responseId: responseId },
                { $push: { ratings: ratings }, }
            ).exec();
        } catch (error) {
            throw new InternalServerErrorException('Internal Server Error');
        }
    }

    //Acts as a wrapper, frontend sends rating data to backend, backend then sends it to AI API.
    async optimize(ratings, responseId: string): Promise<any> {
        await this.logRatings(responseId, ratings);
        await new Promise(r => setTimeout(r, 400));
        try {
            return await this.httpService.axiosRef({
                url: `http://localhost:${process.env.AI_API_PORT}/optimize`,
                method: 'POST',
                data: {
                    responseId: responseId,
                    ratings: ratings
                },
                responseType: 'stream',
            });
        } catch (error) {
            throw new InternalServerErrorException('Internal Server Error');
        }
    }

    //Initializes a response, receives prompt from frontend, then sends it to the AI API.
    async initResponse(responseId: string, prompt: any): Promise<any> {
        //Finds the corresponding response and extracts the surveyId and ratings.
        const response = await this.responseModel.findOne({ responseId: responseId });
        const surveyId = response[0].surveyId;
        const ratings = response[0].ratings;


        //Finds the corresponding survey and extracts data.
        const survey = await this.surveyModel.findOne({ _id: surveyId });
        const preVariables = survey[0].preVariables;
        const size = survey[0].parameters.avatarsPerPage;

        await new Promise(r => setTimeout(r, 400));
        try {
            return await this.httpService.axiosRef({
                url: `http://localhost:${process.env.AI_API_PORT}/survey`,
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                data: {
                    preVariables: preVariables,
                    ratings: ratings,
                    prompt: prompt,
                    size: size,
                    responseId: responseId
                }
            });
        } catch (error) {
            throw new InternalServerErrorException('Internal Server Error');
        }
    }

    //Acts as a wrapper, frontend sends a request for result to backend, backend makes a request to API, receives an image.
    async logResult(responseId: string): Promise<StreamableFile> {
        await new Promise(r => setTimeout(r, 400));
        try {
            const response = await this.httpService.axiosRef({
                url: `http://localhost:${process.env.AI_API_PORT}/result`, 
                method: 'POST',
                data: {
                    responseId: responseId,
                },
                responseType: 'json',
                });

            const { prompt: resPrompt, image: resImage} = response.data;

            //Logs the promptstring.
            await this.logPromptstring(responseId, resPrompt);

            // Converts streamable image to bytes.
            const imageBytes = base64.toByteArray(resImage);
            
            // Creates a buffer from bytes.
            const buffer = Buffer.from(imageBytes);

            //Logs the buffer.
            await this.logBuffer(responseId, buffer);
            
            return new StreamableFile(imageBytes);
        } catch (error) {
            throw new InternalServerErrorException('Internal Server Error');
        }
    }

    //Deletes a response.
    async deleteReponse(responseId: string): Promise<any> {
        try {
            await this.responseModel.findOneAndDelete({responseId: responseId}).exec();
            return { message: 'Responses deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException('Internal Server Error');
        }
    }

    //Deletes all response by regex string.
    async deleteReponses(key: string, regex: string): Promise<any> {
        const reg = new RegExp(regex);
        try {
            await this.responseModel.deleteMany( { [key]: { $regex: reg}}).exec();
            return { message: 'Responses deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException('Internal Server Error');
        }
        
    }
}
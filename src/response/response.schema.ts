import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document } from 'mongoose';

export type ResponseDocument = Response & Document;

// This is unfinished, should probably be modified to accept a whole response after a user has
// completed a survey, aka. every choice for every rating scale for every image for every page
// in the survey.

@Schema()
export class Response {
    @Prop( {required: true} )
    _id: String;

    @Prop( {required: true} )
    surveyId: String;

    @Prop( {required: true, unique: true} )
    responseId: String;

    @Prop( {type: Date, default: Date.now} )
    createdAt: Date;

    //Stores the prompt string for each iteration.
    @Prop( {type: MongooseSchema.Types.Array} )
    promptStrings: [String];

    //Stores the image as string.
    @Prop({type: MongooseSchema.Types.Array})
    generatedImageBatch: [Buffer];

    //Stores the filter response as string.
    @Prop({type: MongooseSchema.Types.Array})
    filterResponses: [String];

    //Stores the scores to generated pictures from user response as number.
    @Prop({type: MongooseSchema.Types.Array})
    ratings: [Number];


    //-------------------------------------------------

    //Makes it so that only one of these 4 are active at a time for each respone
    @Prop( { type: String, enum: ['sliderScore', 'starScore', 'selectScore', 'swipeScore']})
    activeField: String;

    /* @Prop( {required: true} )
    minValue: number;

    @Prop( {required: true} )
    maxValue: number; */

    @Prop( {type: Map, of: Number})
    sliderScore: Map<String, Number>;

    @Prop( {type: Map, of: Number})
    starScore: Map<String, Number>;

    //For later use: The value number can still be used as a bool, 1 can be true and 0 can be false 
    @Prop( {type: Map, of: Number})
    selectScore: Map<String, Number>;

    //For later use: The value number can still be used as a bool, 1 can be true and 0 can be false 
    @Prop( {type: Map, of: Number})
    swipeScore: Map<String, Number>;

}

export const ResponseSchema = SchemaFactory.createForClass(Response);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document } from 'mongoose';

export type SurveyDocument = Survey & Document;

@Schema()
class Parameters {
    @Prop({ required: true, minimize: false })
    maxIterations: Number;
    @Prop({ required: true, minimize: false })
    avatarsPerPage: Number;
    @Prop({ required: true })
    abort: boolean;
    @Prop({ required: true })
    explainDecision: boolean;
    @Prop({ required: true })
    explainRequired: boolean;
    @Prop({ required: true })
    generateAvatar: boolean;
    @Prop({ required: true })
    webcam: boolean;
    @Prop({ required: true })
    imageUpload: boolean;
    @Prop({ required: true })
    welcomePage: boolean;
    @Prop({ required: true })
    endPage: boolean;
    @Prop({ required: true })
    finalSelection: boolean;
}

@Schema()
class GenVariable {
    @Prop()
    name: string;
    @Prop()
    range: string;
}


@Schema()
class PreVariables {
    @Prop()
    gender: [string];
    @Prop()
    eyecolor: [string];
    @Prop()
    eyesize: [string];
    @Prop()
    haircolour: [string];
    @Prop()
    hairlength: [string];
    @Prop()
    hairstructure: [string];
    @Prop()
    skincolour: [string];
    @Prop()
    nose: [string];
    @Prop()
    mouth: [string];
    @Prop()
    earsize: [string];
    @Prop()
    facewidth: [string];
    @Prop()
    facialhair: [string];
    @Prop()
    glasses: [string];
    @Prop()
    stature: [string];
    @Prop()
    agerange: [number];
}

@Schema()
class RatingScale {
    @Prop()
    name: string;

    @Prop()
    type: string;

    @Prop()
    text: string;

    @Prop()
    labelGood: string;

    @Prop()
    labelBad: string;
}

@Schema()
class TextPage {
    @Prop()
    title: string;

    @Prop()
    content: string;
}

@Schema()
export class Survey {

    @Prop({ minimize: false, default: false })
    activated: boolean;
    
    @Prop()
    surveyId: string;

    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ required: false })
    filterQuestions: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    userId: string;

    @Prop({ required: true })
    createdAt: Date;

    @Prop({ required: true })
    updatedAt: Date;

    @Prop({
        required: true,
        default: {
            maxIterations: 4,
            avatarsPerPage: 4,
            abort: false,
            explainDecision: false,
            explainRequired: false,
            generateAvatar: true,
            webcam: false,
            imageUpload: false,
            welcomePage: false,
            endPage: false,
            finalSelection: false
        },
    })
    parameters: Parameters;

    @Prop({
        gender: [],
        eyecolor: [],
        eyesize: [],
        haircolour: [],
        hairlength: [],
        hairstructure: [],
        skincolour: [],
        nose: [],
        mouth: [],
        earsize: [],
        facewidth: [],
        facialhair: [],
        glasses: [],
        stature: [],
        agerange: []
    })
    preVariables: PreVariables;

    @Prop({ type: MongooseSchema.Types.Array })
    generativeVariables: GenVariable[];

    @Prop({ default: [{ name: "Standard", type: "Slider", text: "", labelGood: "opt1good", labelBad: "opt1bad" }] })
    ratingScales: RatingScale[];

    @Prop({ default: { title: "", content: "" } })
    welcomePage: TextPage;

    @Prop({ default: { title: "", content: "" } })
    endPage: TextPage;

    @Prop()
    prompt: string;

}

export const SurveySchema = SchemaFactory.createForClass(Survey);

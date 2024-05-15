// Not used(?), incl. JWT_SECRET in .env

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";

import { Strategy } from 'passport-custom';
import { SurveyService } from "src/survey/survey.service";

@Injectable()
export class IsActiveStrategy extends PassportStrategy(Strategy, "isactive") {
  constructor(private survey: SurveyService) {
    super();
  }

  
  async validate(payload: any) {
    
    const parts = payload.url.split('/');
    const surveyid = parts[parts.length - 1];

    const study = await this.survey.findOne({_id: surveyid});
    if (study?.activated === true){
      return payload;
    }else{
      throw new UnauthorizedException("study not active");
    }

  }
}
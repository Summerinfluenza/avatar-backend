import { Body, Controller, Req, Res, Post, Delete, Get, Patch, UseGuards, Param, HttpStatus, HttpException } from "@nestjs/common";
import { SurveyService } from "./survey.service";
import { Survey } from "./survey.schema";
import { Request, Response } from "express";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import * as sqlstring from 'sqlstring';

// Hack to prevent error in Swagger :^)
class SwaggerDto { }

@ApiTags('Survey')
@Controller('survey')
export class SurveyController {
    constructor(
        private readonly surveyService: SurveyService
    ) {}

    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth()
    @Get('/')
    @ApiOperation({ description: "Get all surveys created by the logged in account. Accepts an access token." })
    async findAllSurveys(@Req() req: Request): Promise<any> {
        const userId = sqlstring.escape(req.user['sub']).replace(/'/g, "");

        try {
            return await this.surveyService.findAll(userId);
        } catch (error) {
            // Handle validation errors
            console.log(error);
            if (error.name === 'ValidationError') {
                throw new HttpException('ValidationError', HttpStatus.FORBIDDEN);
            } else if (error.name === 'UnauthorizedError') {
                throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
            } else if (error.name === 'NotFoundError') {
                throw new HttpException('Survey not found', HttpStatus.NOT_FOUND);
            } else {
                throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }


    @UseGuards(AuthGuard(["jwt", "isactive"]))
    @ApiBearerAuth()
    @Get('/:id')
    @ApiOperation({ description: "Get a survey. Requires authentication unless the survey is *activated*. Accepts an access token." })
    async findOne(@Param() params: any, @Req() req: Request) {
        const userId = sqlstring.escape(params.id).replace(/'/g, "");
        const survey = await this.surveyService.findOne({_id: userId});
        if (!survey) throw new HttpException("Invalid survey id", HttpStatus.BAD_REQUEST);
        if (req.user || survey.activated) {
            return survey;
        } else {
            throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
        }
    }

    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth()
    @Post('/create')
    @ApiOperation({ description: "Create a new survey. Accepts an access token." })
    @ApiBody({
        type: SwaggerDto,
        examples: {
            basic: {
                summary: 'New Survey',
                value: {
                    title: 'New Survey'
                },
            },
            upload: {
                summary: 'Upload Survey',
                value: {
                    "title": "Survey Title",
                    "parameters": {
                        "maxIterations": 4,
                        "avatarsPerPage": 4,
                        "abort": false,
                        "explainDecision": false,
                        "explainRequired": false,
                        "generateAvatar": true,
                        "webcam": false,
                        "imageUpload": false,
                        "welcomePage": false,
                        "endPage": false,
                        "finalSelection": false,
                        "_id": "65708e2fa6ab278e21e4c0b0"
                    },
                    "generativeVariables": [
                        {
                            "name": "Age",
                            "range": "1-100"
                        },
                    ],
                    "ratingScales": [
                        {
                            "name": "Trustiness",
                            "text": "How trustworthy is this person?",
                            "type": "Slider",
                            "labelGood": "0",
                            "labelBad": "100"
                        }
                    ],
                    "welcomePage": {
                        "title": "",
                        "content": "",
                        "_id": "65708e2fa6ab278e21e4c0b1"
                    },
                    "endPage": {
                        "title": "",
                        "content": "",
                        "_id":
                        "65708e2fa6ab278e21e4c0b2"
                    },
                    "__v": 0,
                    "description": "awesome description",
                    "activated": true
                }
            }
        },
    })
    async createSurvey(@Req() req: Request) {
        const userId = sqlstring.escape(req.user['sub']).replace(/'/g, "");
        try {
            await this.surveyService.createSurvey(userId, req.body);
            return { message: 'Survey created successfully' };
        } catch (error) {
            // Handle validation errors
            if (error.name === 'ValidationError') {
                throw new HttpException('ValidationError', HttpStatus.FORBIDDEN);
            } else if (error.name === 'UnauthorizedError') {
                throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
            } else if (error.name === 'NotFoundError') {
                throw new HttpException('Survey not found', HttpStatus.NOT_FOUND);
            } else {
                throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth()
    @Delete('/delete')
    @ApiOperation({ description: "Delete a survey. Accepts an access token." }) 
    @ApiBody({
        type: SwaggerDto,
        examples: {
            basic: {
                summary: 'Delete a survey',
                value: {
                    _id: '65708e2fa6ab278e21e4c0b3',
                },
            },
        },
    })
    async deleteSurvey(@Req() req: Request, @Body('_id') _id: string) {
        const userId = sqlstring.escape(req.user['sub']).replace(/'/g, "");
        try {
            return await this.surveyService.deleteSurvey({_id: _id, userId: userId}); 
        } catch (error) {
            // Handle validation errors
            if (error.name === 'ValidationError') {
                throw new HttpException('ValidationError', HttpStatus.FORBIDDEN);
            } else if (error.name === 'UnauthorizedError') {
                throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
            } else if (error.name === 'NotFoundError') {
                throw new HttpException('Survey not found', HttpStatus.NOT_FOUND);
            } else {
                throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth()
    @Post('/download')
    @ApiOperation({ description: "Downloads a survey. Requires authentication unless the survey is *activated*. Accepts an access token." })
    @ApiBody({
        type: SwaggerDto,
        examples: {
            basic: {
                summary: 'Download a survey',
                value: {
                    _id: '662907675638e01639cb2b55',
                },
            },
        },
    })
    async downloadSurvey(@Res() res: Response, @Req() req: Request) {
        //Downloads a survey as a json file.
        const request = sqlstring.escape(req.body).replace(/'/g, "");
        const downloadRequest = request;
        try {
            const survey = await this.surveyService.downloadSurvey(downloadRequest);
            if (survey) {
                //Sets headers.
                res.setHeader('Content-Disposition', 'attachment; filename=survey.zip');
                res.setHeader('Content-Type', 'application/zip');
                res.status(201).send(survey);

                return { message: 'Survey downloaded successfully' }
            }
        } catch (error) {
            if (error.name === 'ValidationError') {
                throw new HttpException('ValidationError', HttpStatus.FORBIDDEN);
            } else if (error.name === 'UnauthorizedError') {
                throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
            } else if (error.name === 'NotFoundError') {
                throw new HttpException('Survey not found', HttpStatus.NOT_FOUND);
            } else {
                throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    
    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth()
    @Patch('/edit')
    @ApiOperation({ description: "Edit an existing survey. Accepts an access token." })
    @ApiBody({
        type: SwaggerDto,
        examples: {
            basic: {
                summary: 'Edit a survey',
                value: {
                    _id: '65708e2fa6ab278e21e4c0b3',
                    updates: {
                        title: "New Title"
                    }
                },
            },
        },
    })
    async updateSurvey(@Req() req: Request, @Body('_id') _id: string, @Body('updates') updates: Partial<Survey>) {
        const userId = sqlstring.escape(req.user['sub']).replace(/'/g, "");
        try {
            await this.surveyService.updateSurvey(userId, _id, updates);
            return { message: 'Survey updated successfully' }
        } catch (error) {
            if (error.name === 'ValidationError') {
                throw new HttpException('ValidationError', HttpStatus.FORBIDDEN);
            } else if (error.name === 'UnauthorizedError') {
                throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
            } else if (error.name === 'NotFoundError') {
                throw new HttpException('Survey not found', HttpStatus.NOT_FOUND);
            } else {
                throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
}

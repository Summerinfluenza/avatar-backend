import { Controller, UseGuards, Delete, Patch, Post, Req, HttpStatus, HttpException, StreamableFile } from "@nestjs/common";
import { ResponseService } from "./response.service";
import { Request, Response as Resp } from "express";
import { ApiOperation, ApiTags, ApiBody, ApiBearerAuth, ApiOkResponse } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import * as sqlstring from 'sqlstring';

class SwaggerDto { }

@ApiTags('Response')
@Controller('response')
export class ResponseController {
    constructor(
        private readonly responseService: ResponseService) { }

    @Post("create")
    @ApiOperation({ description: "Creates a new response. Returns a responseId." })
    @ApiBody({
        type: SwaggerDto,
        examples: {
            basic: {
                summary: 'create response',
                value: {
                    "surveyId": "#2rasf3%#%6dsf"
                }
            }
        },
    })
    async createResponse(@Req() req: Request): Promise<any> {
        const surveyId = sqlstring.escape(req.body["_id"]).replace(/'/g, "");

        try {
            return await this.responseService.createResponse(surveyId, req.body);
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
    @Patch("logprompt")
    @ApiOperation({ description: "Logs generated prompt string. Accepts an access token." })
    @ApiBody({
        type: SwaggerDto,
        examples: {
            basic: {
                summary: 'Logs generated prompt string.',
                value: {
                    "responseId": "43653dfgd%¤&fdg",
                    "promptString": "A beautiful green eyed lady with silver colored hair"
                }
            }
        },
    })
    async logPromptstring(@Req() req: Request): Promise<any> {
        const responseId = sqlstring.escape(req.body["responseId"]).replace(/'/g, "");
        const promptString = sqlstring.escape(req.body["promptString"]).replace(/'/g, "");
        
        try {
            await this.responseService.logPromptstring(responseId, promptString);
            return { message: 'Image buffer logged successfully' };
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
    @Patch("logbuffer")
    @ApiOperation({ description: "Logs generated image iterations. Accepts an access token." })
    @ApiBody({
        type: SwaggerDto,
        examples: {
            basic: {
                summary: 'Logs generated image iterations',
                value: {
                    "responseId": "43653dfgd%¤&fdg",
                    "generatedImageBatch": "345325325263427"
                }
            }
        },
    })
    async logBuffer(@Req() req: Request): Promise<any> {

        const responseId = sqlstring.escape(req.body["responseId"]).replace(/'/g, "");
        const generatedImageBatch = sqlstring.escape(req.body["generatedImageBatch"]).replace(/'/g, "");
        try {
            await this.responseService.logBuffer(responseId, generatedImageBatch); 
            return { message: 'Image buffer logged successfully' };
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
    @Patch("optimize")
    @ApiOperation({ description: "Passes data from frontend to fast-api. Accepts an access token." })
    @ApiBody({
        type: SwaggerDto,
        examples: {
            basic: {
                summary: 'Passes generated rating iterations to fast-api',
                value: {
                    "responseId": "responseId",
                    "ratings": []
                }
            }
        },
    })
    async optimize(@Req() req: Request): Promise<any> {
        const responseId = sqlstring.escape(req.body["responseId"]).replace(/'/g, "");
        const ratings = sqlstring.escape(req.body["ratings"]).replace(/'/g, "");
        
        try {
            await this.responseService.optimize(ratings, responseId);
            return { message: 'Operation performed successfully' };
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
    @Post("initialize")
    @ApiOperation({ description: "Initializes a response, passes data from frontend to fast-api.. Accepts an access token." })
    @ApiBody({
        type: SwaggerDto,
        examples: {
            basic: {
                summary: 'Sends user generated rating and prompt iterations to fast-api',
                value: {
                    "responseId": "responseId",
                    "prompt": "prompt"
                }
            }
        },
    })
    async initResponse(@Req() req: Request) {

        const responseId = sqlstring.escape(req.body["responseId"]).replace(/'/g, "");
        const prompt = sqlstring.escape(req.body["prompt"]).replace(/'/g, "");
        try {
            await this.responseService.initResponse(responseId, prompt);
            return { message: 'Operation performed successfully' };
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
    @Post("result")
    @ApiOperation({ description: "Logs and returns the end-result JPEG image from the Fast-API. Accepts an access token." })
    @ApiBody({
        type: SwaggerDto,
        examples: {
            basic: {
                summary: 'Receives an responseId, logs and returns the end-result from the Fast-API',
                value: {
                    "responseId": "responseId"
                }
            }
        },
    })
    async logResult(@Req() req: Request): Promise<StreamableFile> {
        const responseId = sqlstring.escape(req.body["responseId"]).replace(/'/g, "");
        
        try {
            return await this.responseService.logResult(responseId);
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
    @Delete("delete")
    @ApiOperation({ description: "Deletes an existing response. Accepts an access token." })
    @ApiBody({
        type: SwaggerDto,
        examples: {
            basic: {
                summary: 'Deletes an existing response.',
                value: {
                    "responseId": "43653dfgd%¤&fdg"
                }
            }
        },
    })
    async deleteResponse(@Req() req: Request) {
        
        const responseId = sqlstring.escape(req.body["responseId"]).replace(/'/g, "");
        
        try {
            this.responseService.deleteReponse(responseId)
            return { message: 'Response deleted successfully' };
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
    @Delete("deleteall")
    @ApiOperation({ description: "Deletes all existing responses by regex string. Accepts an access token." })
    @ApiBody({
        type: SwaggerDto,
        examples: {
            basic: {
                summary: 'Choose a key, then find and delete all matching responses.',
                value: {
                    "key": "responseId",
                    "regex": "43653dfgd%¤&fdg"
                }
            }
        },
    })
    @ApiOkResponse({
        description: "All matched responses have been deleted.",
        schema: {
            type: "JSON",
            example: {
                msg: "All matched responses have been deleted"
            }
        }
    })
    async deleteResponses(@Req() req: Request): Promise<any> {
        const key = sqlstring.escape(req.body["key"]).replace(/'/g, "");
        const regex = sqlstring.escape(req.body["regex"]).replace(/'/g, "");

        try {
            return await this.responseService.deleteReponses(key, regex);
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

import { Controller, Req, Post, UseGuards} from "@nestjs/common";
import { Request } from "express";
import { AvatarService } from './avatar.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import * as sqlstring from 'sqlstring';

class SwaggerDto { }

@ApiTags('Avatar')
@Controller('avatar')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) { }

  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @Post("generate")
  @ApiOperation({ description: "Generate avatars." })
  @ApiBody({
    type: SwaggerDto,

    examples: {
        guest: {
            summary: 'Generate avatars with parameters. Returns a jpeg file.',
            value: {
              responseId: "43653dfgd%¤&fdg",
              iterations: 10,
              size: 10,
              prompt: "A ultra abstract 61 y.o. female person in front of grey background without glasses, salmon skin color"
            },
        },
        researcher: {
          summary: 'Generate a single avatar. Returns a jpeg file.',
          value: {
            prompt: "A ultra abstract 61 y.o. female person in front of grey background without glasses, salmon skin color"
          },
      },
    },
  })
  async getAvatar(@Req() req: Request): Promise<any> {
    const responseId = sqlstring.escape(req.body["responseId"]).replace(/'/g, "");
    const iterations = sqlstring.escape(req.body["iterations"]).replace(/'/g, "");
    const size = sqlstring.escape(req.body["size"]).replace(/'/g, "");
    const prompt = sqlstring.escape(req.body["prompt"]).replace(/'/g, "");

    try {
      return this.avatarService.getAvatar(responseId, iterations, size, prompt);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return { message: 'ValidationError', statusCode: 403 };
        } else if (error.name === 'NotFoundError') {
            return { message: 'Survey not found', statusCode: 404 };
        } else {
            return { message: 'Internal Server Error', statusCode: 500 };
        }
    }
    
  }
}

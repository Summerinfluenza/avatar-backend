import { Injectable, StreamableFile, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as base64 from 'base64-js';
import { ResponseService } from "../response/response.service";
 
@Injectable()
export class AvatarService {
  constructor(private readonly httpService: HttpService, 
              private readonly responseService: ResponseService)
  { }
  
  async getAvatar(responseId = "", iterations = 0, size = 1, prompt = ""): Promise<StreamableFile> {
    try {
      // Configures the POST request to AI API with parameters to generate images.
      await new Promise(r => setTimeout(r, 400));
      const response = await this.httpService.axiosRef({
        url: `http://localhost:${process.env.AI_API_PORT}/avatar`,
        method: 'POST',
        data: {
          responseId: responseId,
          iterations: iterations,
          size: size,
          prompt: prompt
        },
        responseType: 'json',
      });

      const { prompt: resPrompt, image: resImage} = response.data;
      console.log("image printed");

      // Converts streamable image to bytes.
      const imageBytes = base64.toByteArray(resImage);
      
      // Checks responseid whether the request is from an user.
      if (responseId) {
        // Creates a buffer from bytes.
        const buffer = Buffer.from(imageBytes);
        await this.responseService.logBuffer(responseId, buffer);
        await this.responseService.logPromptstring(responseId, resPrompt);
      }
      
      // Returns image as a byte file.
      return new StreamableFile(imageBytes);
    } catch (Error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}

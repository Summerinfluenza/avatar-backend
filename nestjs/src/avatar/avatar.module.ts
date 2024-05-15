import { Module } from '@nestjs/common';
import { AvatarController } from './avatar.controller';
import { AvatarService } from './avatar.service';
import { HttpModule } from '@nestjs/axios';
import { ResponseModule } from 'src/response/response.module';

@Module({
  imports: [HttpModule, ResponseModule],
  controllers: [AvatarController],
  providers: [AvatarService],
})
export class AvatarModule {}

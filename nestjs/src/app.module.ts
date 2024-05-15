import { Module } from '@nestjs/common';
import { AvatarModule } from './avatar/avatar.module';
import { UserModule } from './auth/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { SurveyModule } from './survey/survey.module';
import { ResponseModule } from './response/response.module';
import { CryptoModule } from './crypto/crypto.module';
import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    AvatarModule,
    UserModule,
    MongooseModule.forRoot(`mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@cluster0.tokgkkp.mongodb.net/?retryWrites=true&w=majority`, {dbName: 'avatair-nest'}),  
    SurveyModule,
    ResponseModule,
    CryptoModule,
    EmailModule
  ],
  providers: [EmailService]
})
export class AppModule {}

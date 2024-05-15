import {  Logger, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { SurveySchema } from 'src/survey/survey.schema';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { CryptoModule } from 'src/crypto/crypto.module';
import { SurveyModule } from 'src/survey/survey.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { IsActiveStrategy } from './strategies/isactive.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { LocalStrategy } from './strategies/local.auth';
import { EmailModule } from 'src/email/email.module';
import { EmailService } from 'src/email/email.service';

  
@Module({
    imports: [
        JwtModule.register({}),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: 'survey', schema: SurveySchema },
        ]),
        CryptoModule,
        SurveyModule,
        PassportModule,
        EmailModule
    ],
    providers: [UserService, AuthService, RefreshTokenStrategy, JwtStrategy, IsActiveStrategy, LocalStrategy, EmailService],
    controllers: [UserController],
    exports: [UserService, AuthService],
})
export class UserModule {
    private readonly logger = new Logger(UserModule.name);
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
    ) {}
    async onModuleInit() {
        this.logger.verbose('Initializing admin');
        // create admin on system start if necessary
        const admin = await this.userService.admin.getAdmin();
        if (admin !== null) {
            this.logger.verbose('Existing admin found');

            //if admin exist
            const ret = await this.authService.validateUser(
                admin.email,
                this.userService.admin.pw,
            );
            if (ret === null) {
                this.logger.verbose(
                    'new  admin password set in env var, updating admin password',
                );
                // password differs from env var, update password!
                this.userService.admin.updateAdmin(
                    admin,
                    this.userService.admin.pw,
                );
            }
        }
    }
}

import { Body, Controller, Post, Get, UseGuards, Req, HttpException, HttpStatus, HttpCode, Put, UnauthorizedException, forwardRef, Inject } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.schema";
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from "src/auth/auth.service";
import { Request } from "express";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { CreateUserDto } from "./user.dto";
import * as sqlstring from 'sqlstring';

// Hack to prevent error in Swagger :^)
class SwaggerDto { }

@ApiTags('Auth')
@Controller('auth')
export class UserController {
    constructor(
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService
    ) { 
    }

    @Put('signup')
    @HttpCode(201)
    @ApiOperation({ description: "Create a new account." })
    @ApiBody({
        type: SwaggerDto,
        examples: {
            basic: {
                summary: 'Create a new account',
                value: {
                    email: 'example@domain.com',
                    password: 'password',
                },
            },
        },
    })
    async createUser(
        @Body() createUserDto: CreateUserDto,
    ): Promise<User> {
        if (this.userService.admin.adminExist){
            throw new HttpException("No signups possible", HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.userService.createUser(createUserDto);
        } catch (err) {
            
            if (err?.code == 11000){                
                throw new HttpException("Email already exists", HttpStatus.BAD_REQUEST);
            }else if (err?.errors?.email){
                throw new HttpException("Invalid email", HttpStatus.BAD_REQUEST);
            }else{
                throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);
            }
        }
    }

    @HttpCode(200)
    @UseGuards(AuthGuard('local'))
    @Post('login')
    @ApiOperation({ description: "Log in to an account. Returns an access token and a refresh token." })
    @ApiBody({
        type: SwaggerDto,
        examples: {
            basic: {
                summary: 'Login to account',
                value: {
                    email: 'example@domain.com',
                    password: 'password',
                },
            },
        },
    })
    async login(@Req() req: Request) {
        //Data sanitization.
        req.user["email"] = sqlstring.escape(req.user["email"]).replace(/'/g, "");
        req.user["password"] = sqlstring.escape(req.user["password"]).replace(/'/g, "");
        try {
            return this.authService.login(req.user);
        } catch (err) {
            if (err?.errors?.email){
                throw new HttpException("Invalid email", HttpStatus.BAD_REQUEST);
            }else{
                throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);
            }
        }
    }
    

    @UseGuards(AuthGuard("jwt"))
    @Get('logout')
    @ApiBearerAuth()
    @ApiOperation({ description: "Log out of an account. Accepts an access token." })
    async logout(@Req() req: Request) {
        const userId = sqlstring.escape(req.user['sub']).replace(/'/g, "");      
        try {
            return this.userService.update(userId, { refreshToken: null });
        } catch (err) {
            if (err?.errors?.email){
                throw new HttpException("Invalid email", HttpStatus.BAD_REQUEST);
            }else{
                throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);
            }
        }
    }

    @UseGuards(AuthGuard('jwt-refresh'))
    @Get('refresh')
    @ApiBearerAuth()
    @ApiOperation({ description: "Refresh an access token. Returns new access and refresh tokens. Accepts a refresh token." })
    async refreshTokens(@Req() req: Request) {

        const email = sqlstring.escape(req.user['email']).replace(/'/g, ""); 
        const refreshToken = sqlstring.escape(req.user['refreshToken']).replace(/'/g, ""); 
        try{
            const tokens = await this.authService.refreshTokens(email, refreshToken);
            return tokens;
            
        } catch(e){
            return new UnauthorizedException();
        }
    }

    @Post('reset')
    @ApiOperation({ description: "Resets the password through email." })
    @ApiBody({
        type: SwaggerDto,
        examples: {
            basic: {
                summary: 'Resets password.',
                value: {
                    email: 'example@domain.com'
                },
            },
        },
    })
    async reset(@Req() req: Request){
        const email = sqlstring.escape(req.body["email"]).replace(/'/g, "");
        try {
            return this.userService.resetPassword(email);
        } catch (err) {
            if (err?.errors?.email){
                throw new HttpException("Invalid email", HttpStatus.BAD_REQUEST);
            }else{
                throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);
            }
        }
    }
}

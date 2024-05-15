import {ForbiddenException, Injectable, NotAcceptableException } from '@nestjs/common';
import { UserService } from 'src/auth/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CryptoService } from 'src/crypto/crypto.service';

@Injectable()
export class AuthService {

    constructor(
        private readonly userService: UserService,
        private jwtService: JwtService,
        private cryptoService: CryptoService,
    ) {
    }

    async validateUser(email: string, password: string): Promise<any> {
        let user;
        if (email == "admin"){            
            user = await this.userService.admin.getAdmin();
        }else{
            user = await this.userService.getUser({ email });
        }
        if (!user) throw new NotAcceptableException('User does not exist');
        const passwordValid = await bcrypt.compare(password, user.password);
        return user && passwordValid ? user : null;
    }

    async login(user: any) {
        const tokens = await this.getTokens(user);
        await this.updateRefreshToken(user._id, tokens.refreshToken);
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    private async updateRefreshToken(userId: string, refreshToken: string) {
        const saltRounds = 10;
        const hashedRefreshToken = await bcrypt.hash(refreshToken, saltRounds);
        await this.userService.update(userId, {
            refreshToken: hashedRefreshToken,
        });
    }

    async refreshTokens(email: string, refreshToken: string) {
        const user = await this.userService.getUser({ email });
        if (!user || !user.refreshToken)
            throw new ForbiddenException('Access Denied');
        const refreshTokenMatches = await bcrypt.compare(
            refreshToken,
            user.refreshToken,
        );
        if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
        const tokens = await this.getTokens(user);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }

    async getTokens(user: any) {
        let data;

        if (process.env.ENCRYPTED_JWT == 'true') {
            data = { payload: this.cryptoService.enc({email: user.email, sub: user._id}) };
        } else {
            data = { payload: {email: user.email, sub: user._id} };
        }

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(data, {
                secret: process.env.JWT_ACCESS_SECRET,
                expiresIn: '15m',
            }),
            this.jwtService.signAsync(data, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: '7d',
            }),
        ]);

        return { accessToken, refreshToken };
    }
}

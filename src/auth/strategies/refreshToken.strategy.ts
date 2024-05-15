import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { CryptoService } from 'src/crypto/crypto.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private cryptoService: CryptoService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
    });
  }

  validate(req: Request, data: any) {
    let payload;
    if (process.env.ENCRYPTED_JWT == 'true') {
      payload = this.cryptoService.dec(data.payload);
    } else {
      payload = data.payload;
    }

    
    const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
    return { ...payload, refreshToken };
    
  }
}


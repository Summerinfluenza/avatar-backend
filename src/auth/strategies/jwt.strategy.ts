// Not used(?), incl. JWT_SECRET in .env

import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";

import { ExtractJwt, Strategy } from "passport-jwt";
import { CryptoService } from "src/crypto/crypto.service";




@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private cryptoService: CryptoService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  async validate(request: any) {
    let payload;
    if (process.env.ENCRYPTED_JWT == 'true') {
      payload = this.cryptoService.dec(request.payload);
    } else {
      payload = request.payload;
    }

    return payload;
  }
}
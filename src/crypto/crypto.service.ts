import { Injectable } from '@nestjs/common';
import SimpleCrypto from 'simple-crypto-js';

@Injectable()
export class CryptoService {
  private readonly simpleCrypto: SimpleCrypto;
  constructor(    
  ) {
    this.simpleCrypto = new SimpleCrypto(process.env.AES_SECRET);
  }

  public enc(data: object): string {
    return this.simpleCrypto.encrypt(data);
  }

  public dec(encryptedData: string): any {
    return this.simpleCrypto.decrypt(encryptedData);
  }
}

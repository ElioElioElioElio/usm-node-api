import { Injectable } from '@nestjs/common';
import { PassportStrategy, AuthGuard } from '@nestjs/passport';
import { BearerStrategy, OIDCStrategy } from 'passport-azure-ad';

/**
 * Extracts ID token from header and validates it.
 */
@Injectable()
export class AzureADStrategy extends PassportStrategy(
  OIDCStrategy,
  'azure-ad',
) {
  constructor() {
    console.log('AD STRAT');
    super({
      identityMetadata: `${process.env.OIDC_SERVER}/.well-known/openid-configuration`,
      clientID: `${process.env.OIDC_CLIENT_ID}`,
      responseType: 'code',
      responseMode: 'query',
      redirectUrl: `${process.env.OIDC_CALLBACK}`,
      clientSecret: `${process.env.OIDC_SHARED_SECRET}`,
      passReqToCallback: false,
      scope: ['openid'],
    });
  }

  async validate(profile, done) {
    console.log(profile);
    //return data;
  }
}

export const AzureADGuard = AuthGuard('azure-ad');

import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { AzureADStrategy } from './azure-ad.guard';
import { SessionSerializer } from './session-serializer';

@Module({
  controllers: [LoginController],
  providers: [AzureADStrategy, SessionSerializer],
})
export class LoginModule {}

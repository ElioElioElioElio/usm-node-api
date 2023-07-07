import { Controller, Get, Req, Res, Session, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AzureADGuard } from './azure-ad.guard';
import * as session from 'express-session';

@Controller('login')
export class LoginController {
  @UseGuards(AzureADGuard)
  @Get('/')
  login() {}

  //@UseGuards(AzureADGuard)
  @Get('/callback')
  loginCallback(@Req() req: any, @Res() res: Response, @Session() ses) {
    console;
    console.log(req.session['OIDC: 169c5d1f-af76-4a41-bb0d-90fcdf6a0097']);
    res.redirect('/');
  }
}

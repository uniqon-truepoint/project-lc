import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { LoginHistoryService } from '../auth/login-history/login-history.service';
import { JwtAuthGuard } from '../_nest-units/guards/jwt-auth.guard';
import { SocialService } from './social.service';
@Controller('social')
export class SocialController {
  constructor(
    private readonly loginHistoryService: LoginHistoryService,
    private readonly socialService: SocialService,
  ) {}

  private readonly frontMypageUrl = 'http://localhost:4200/mypage';

  /** email 로 가입된 셀러에 연동된 소셜계정목록 반환 */
  @UseGuards(JwtAuthGuard)
  @Get('/accounts')
  async getSocialAccounts(@Query('email') email: string) {
    return this.socialService.getSocialAccounts(email);
  }

  /** 구글 ************************************************ */
  @Get('/google/login')
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuth() {}

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    this.socialService.login(req, res);

    // 로그인 기록 추가 by @hwasurr
    this.loginHistoryService.createLoginStamp(req, '소셜/구글');
    return res.redirect(this.frontMypageUrl);
  }

  @Delete('/google/unlink/:googleId')
  async googleUnlink(@Param('googleId') googleId: string) {
    await this.socialService.googleUnlink(googleId);
    return this.socialService.deleteSocialAccountRecord(googleId);
  }

  /** 네이버 ************************************************ */
  @Get('/naver/login')
  @UseGuards(AuthGuard('naver'))
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async naverAuth() {}

  @Get('/naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverAuthCallback(@Req() req: Request, @Res() res: Response) {
    this.socialService.login(req, res);
    // 로그인 기록 추가 by @hwasurr
    this.loginHistoryService.createLoginStamp(req, '소셜/네이버');
    return res.redirect(this.frontMypageUrl);
  }

  @Delete('/naver/unlink/:naverId')
  async naverUnlink(@Param('naverId') naverId: string) {
    await this.socialService.naverUnlink(naverId);
    return this.socialService.deleteSocialAccountRecord(naverId);
  }

  /** 카카오 ************************************************ */
  @Get('/kakao/login')
  @UseGuards(AuthGuard('kakao'))
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async kakaoAuth() {}

  @Get('/kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthCallback(@Req() req: Request, @Res() res: Response) {
    this.socialService.login(req, res);
    // 로그인 기록 추가 by @hwasurr
    this.loginHistoryService.createLoginStamp(req, '소셜/카카오');
    return res.redirect(this.frontMypageUrl);
  }

  @Delete('/kakao/unlink/:kakaoId')
  async kakaoUnlink(@Param('kakaoId') kakaoId: string) {
    await this.socialService.kakaoUnlink(kakaoId);
    return this.socialService.deleteSocialAccountRecord(kakaoId);
  }
}

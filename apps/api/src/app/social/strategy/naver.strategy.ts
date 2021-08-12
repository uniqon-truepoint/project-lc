import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-naver';
import { getApiHost } from '@project-lc/hooks';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocialService, SellerWithSocialAccounts } from '../social.service';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(
    private configService: ConfigService,
    private readonly socialService: SocialService,
  ) {
    super({
      clientID: configService.get('NAVER_CLIENT_ID'),
      clientSecret: configService.get('NAVER_CLIENT_SECRET'),
      callbackURL: `${getApiHost()}/social/naver/callback`,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: null,
    profile: Profile,
  ): Promise<SellerWithSocialAccounts> {
    const { email, nickname, profile_image, id } = profile._json;
    const user = await this.socialService.findOrCreateSeller({
      id,
      provider: 'naver',
      email,
      name: nickname,
      picture: profile_image,
      accessToken,
      refreshToken,
    });

    return user;
  }
}

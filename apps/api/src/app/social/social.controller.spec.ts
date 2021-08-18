import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '@project-lc/prisma-orm';
import { JwtConfigService } from '../../settings/jwt.setting';
import { mailerConfig } from '../../settings/mailer.config';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { CipherService } from '../auth/cipher.service';
import { SellerService } from '../seller/seller.service';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';

describe('SocialController', () => {
  let controller: SocialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        AuthModule,
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.registerAsync({
          useClass: JwtConfigService,
        }),
        MailerModule.forRoot(mailerConfig),
      ],
      controllers: [SocialController],
      providers: [SocialService, AuthService, SellerService, CipherService],
    }).compile();

    controller = module.get<SocialController>(SocialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

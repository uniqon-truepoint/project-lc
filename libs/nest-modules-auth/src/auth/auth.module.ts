import { DynamicModule, Global, Module } from '@nestjs/common';
import { AdminModule } from '@project-lc/nest-modules-admin';
import { BroadcasterModule } from '@project-lc/nest-modules-broadcaster';
import { CartModule } from '@project-lc/nest-modules-cart';
import { CustomerModule } from '@project-lc/nest-modules-customer';
import { MailVerificationModule } from '@project-lc/nest-modules-mail-verification';
import { SellerModule } from '@project-lc/nest-modules-seller';
import { JwtHelperModule } from '@project-lc/nest-modules-jwt-helper';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginHistoryService } from './login-history/login-history.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Global()
@Module({})
export class AuthModule {
  private static imports = [
    SellerModule.withoutControllers(),
    BroadcasterModule.withoutControllers(),
    CustomerModule.withoutControllers(),
    AdminModule.withoutControllers(),
    MailVerificationModule,
    CartModule.withoutControllers(),
    JwtHelperModule,
  ];

  private static providers = [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    LoginHistoryService,
  ];

  private static controllers = [AuthController];
  private static exports = [AuthService, LoginHistoryService];

  static withoutControllers(): DynamicModule {
    return {
      module: AuthModule,
      imports: this.imports,
      providers: this.providers,
      exports: this.exports,
    };
  }

  static withControllers(): DynamicModule {
    return {
      module: AuthModule,
      controllers: this.controllers,
      imports: this.imports,
      providers: this.providers,
      exports: this.exports,
    };
  }
}

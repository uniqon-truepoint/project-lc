import { DynamicModule, Module } from '@nestjs/common';
import { UserPwManager } from '@project-lc/nest-core';
import { MailVerificationModule } from '@project-lc/nest-modules-mail-verification';
import { SellerContactsController } from './seller-contacts.controller';
import { SellerContactsService } from './seller-contacts.service';
import { SellerSettlementHistoryController } from './seller-settlement-history.controller';
import { SellerSettlementService } from './seller-settlement.service';
import { SellerShopService } from './seller-shop.service';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';

@Module({})
export class SellerModule {
  private static readonly providers = [
    SellerService,
    SellerSettlementService,
    SellerShopService,
    SellerContactsService,
    UserPwManager,
  ];

  private static readonly exports = [SellerService, SellerSettlementService];

  private static readonly controllers = [
    SellerController,
    SellerContactsController,
    SellerSettlementHistoryController,
  ];

  private static readonly imports = [MailVerificationModule];

  static withoutControllers(): DynamicModule {
    return {
      module: SellerModule,
      imports: this.imports,
      providers: this.providers,
      exports: this.exports,
    };
  }

  static withControllers(): DynamicModule {
    return {
      module: SellerModule,
      controllers: this.controllers,
      imports: this.imports,
      providers: this.providers,
      exports: this.exports,
    };
  }
}

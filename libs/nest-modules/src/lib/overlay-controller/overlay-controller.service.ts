import { Injectable } from '@nestjs/common';
import { PrismaService } from '@project-lc/prisma-orm';
import { PurchaseMessageWithLoginFlag } from '@project-lc/shared-types';
import { throwError } from 'rxjs';

@Injectable()
export class OverlayControllerService {
  constructor(private readonly prisma: PrismaService) {}

  async getCreatorUrls(): Promise<{ userNickname: string; overlayUrl: string }[]> {
    const urlAndNickname = await this.prisma.user.findMany({
      select: {
        userNickname: true,
        userId: true,
        overlayUrl: true,
      },
    });
    if (!urlAndNickname) throwError('Cannot Get Data From Db');
    return urlAndNickname;
  }

  async uploadPurchase(data: PurchaseMessageWithLoginFlag) {
    const { nickname } = data;
    const text = data.message;
    const price = data.purchaseNum;
    const { loginFlag } = data;
    const creatorId = data.userId;
    const { phoneCallEventFlag } = data;
    const { giftFlag } = data;

    const writePurchaseMessage = await this.prisma.liveCommerceRanking.create({
      data: { nickname, text, price, loginFlag, creatorId, phoneCallEventFlag, giftFlag },
    });
    if (!writePurchaseMessage) throwError('Cannot Get Data From Db');
    return writePurchaseMessage;
  }
}

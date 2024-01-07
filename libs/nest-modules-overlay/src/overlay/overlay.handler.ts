import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PurchaseMessage } from '@project-lc/shared-types';
import { OverlayMessageGateway } from './overlay.message.gateway';
import { NormalPurchaseMessagePayload, OverlayService } from './overlay.service';

@Controller()
export class OverlayHandler {
  constructor(
    private readonly overlayService: OverlayService,
    private readonly overlayMessageGateway: OverlayMessageGateway,
  ) {}

  /** Overlay 라이브쇼핑 구매메시지 핸들러 */
  @MessagePattern('liveshopping:overlay:purchase-msg')
  public async handlePurchaseMsg(@Payload() purchase: PurchaseMessage): Promise<boolean> {
    if (purchase.simpleMessageFlag) {
      return this.overlayService.handleSimplePurchaseMessage(
        purchase,
        this.overlayMessageGateway.server,
      );
    }
    return this.overlayService.handlePurchaseMessage(
      purchase,
      this.overlayMessageGateway.server,
    );
  }

  /** Overlay 일반(상시) 구매메시지 핸들러 */
  @MessagePattern('overlay:purchase-msg')
  public async handleNormalPurchaseMsg(
    @Payload() purchase: NormalPurchaseMessagePayload,
  ): Promise<boolean> {
    return this.overlayService.handleNormalPurchaseMessage(
      {
        broadcasterEmail: purchase.broadcasterEmail,
        nickname: purchase.nickname,
        productName: purchase.productName || '',
        purchaseNum: purchase.purchaseNum,
        message: purchase.message,
        ttsSetting: purchase.ttsSetting,
        giftFlag: purchase.giftFlag,
      },
      this.overlayMessageGateway.server,
    );
  }
}

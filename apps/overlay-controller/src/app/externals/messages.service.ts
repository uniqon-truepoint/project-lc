import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiProperty } from '@nestjs/swagger';
import { TtsSetting } from '@prisma/client';
import { MICROSERVICE_OVERLAY_TOKEN } from '@project-lc/nest-core';
import { OverlayControllerService } from '@project-lc/nest-modules-overlay-controller';
import { PurchaseMessage } from '@project-lc/shared-types';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { catchError, map, Observable, tap, timeout } from 'rxjs';

export class PurchaseMessageNormalDto {
  /** 메시지
   * @example "맛있기도 하고, 팬심으로 구매합니다"
   */
  @ApiProperty({ example: '맛있기도 하고, 팬심으로 구매합니다', description: '메시지' })
  @IsString()
  message: string;

  /**
   * 구매자 닉네임
   */
  @ApiProperty({ example: '나는야구매자', description: '구매자 닉네임' })
  @IsString()
  nickname: string;

  /**
   * 구매물품 가격 (원)
   */
  @ApiProperty({ example: '29900', description: '구매물품 가격 (원)' })
  @Type(() => Number)
  @IsNumber()
  purchaseNum: number;

  /**
   * 구매물품 이름
   */
  @ApiProperty({ example: '미미연어장', description: '구매물품 이름', required: false })
  @IsOptional()
  @IsString()
  productName?: string;

  /**
   * 선물 구매 여부
   */
  @ApiProperty({ example: 'false', description: '선물 구매 여부', required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @Transform(({ value }) => (typeof value === 'string' ? value === 'true' : !!value))
  giftFlag?: boolean = false;

  /**
   * 간략 메시지 송출 여부
   */
  @ApiProperty({
    example: 'false',
    description: '간략 메시지 송출 여부',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @Transform(({ value }) => (typeof value === 'string' ? value === 'true' : !!value))
  simpleMessageFlag?: boolean = false;

  /**
   * tts 세팅
   */
  @ApiProperty({
    default: 'full',
    example: 'full',
    description:
      'tts 세팅 (available values: `full`, `nick_purchase`, `nick_purchase_price`, `only_message`, `no_tts`, `no_sound`)',
    required: false,
  })
  @IsOptional()
  @IsIn(Object.keys(TtsSetting))
  ttsSetting: TtsSetting = TtsSetting.full;
}

export class PurchaseMessageNormalOptions extends PurchaseMessageNormalDto {
  broadcasterEmail: string;
}

export class MessageRes {
  @ApiProperty({ type: 'boolean' }) result: boolean;
}

@Injectable()
export class ExternalMessagesService {
  private readonly logger = new Logger(ExternalMessagesService.name);
  constructor(
    @Inject(MICROSERVICE_OVERLAY_TOKEN) private readonly overlayService: ClientProxy,
    private readonly ocService: OverlayControllerService,
  ) {}

  /** 라이브쇼핑 중인 경우 라이브 도네이션 송출 요청 */
  public async sendLiveMessage(
    broadcasterEmail: string,
    data: PurchaseMessageNormalDto & { liveShoppingId: number },
  ): Promise<Observable<MessageRes>> {
    this.logger.log(
      `Send purchaseLiveMessage to ${broadcasterEmail}. data: ${JSON.stringify(data)}`,
    );
    const {
      liveShoppingId,
      message,
      nickname,
      purchaseNum,
      ttsSetting,
      giftFlag,
      productName,
      simpleMessageFlag,
    } = data;
    const roomName = broadcasterEmail;
    const dto: PurchaseMessage = {
      liveShoppingId,
      message,
      nickname,
      productName,
      purchaseNum,
      roomName,
      ttsSetting,
      giftFlag,
      simpleMessageFlag,
    };
    const uploaded = await this.ocService.uploadPurchase({
      email: roomName,
      loginFlag: !simpleMessageFlag,
      phoneCallEventFlag: false,
      giftFlag,
      liveShoppingId,
      message,
      nickname,
      purchaseNum,
      ttsSetting,
      productName,
    });
    if (!uploaded) {
      throw new InternalServerErrorException('purchase message insertion failed.');
    }
    return this.overlayService
      .emit<boolean, PurchaseMessage>('liveshopping:overlay:purchase-msg', dto)
      .pipe(
        timeout(10 * 1000),
        catchError((err) => {
          throw err;
        }),
        tap((res) => {
          this.logger.log(
            `Send purchaseLiveMessage to ${broadcasterEmail} Responded. res: ${JSON.stringify(
              res,
            )}`,
          );
        }),
        map((res) => ({ result: res })),
      );
  }

  /** 라이브쇼핑 중이 아닌 경우 일반 도네이션 송출 요청 */
  public sendNormalMessage(
    broadcasterEmail: string,
    data: PurchaseMessageNormalDto,
  ): Observable<MessageRes> {
    this.logger.log(
      `Send purchaseNormalMessage to ${broadcasterEmail}. data: ${JSON.stringify(data)}`,
    );
    const dto = { ...data, broadcasterEmail };
    return this.overlayService
      .emit<boolean, PurchaseMessageNormalOptions>('overlay:purchase-msg', dto)
      .pipe(
        timeout(10 * 1000),
        catchError((err) => {
          throw err;
        }),
        tap((res) => {
          this.logger.log(
            `Send purchaseNormalMessage to ${broadcasterEmail} Responded. res: ${JSON.stringify(
              res,
            )}`,
          );
        }),
        map((res) => ({ result: res })),
      );
  }
}

import { TtsSetting } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PurchaseMessage } from '../overlay/overlay-types';

/** 구매 메시지 DTO */
export class PurchaseMessageDto implements PurchaseMessage {
  /** 룸이름 */
  @IsString() roomName: string;

  /** 응원메세지 */
  @IsString() message: string;

  /** 1/2단계 구분 */
  @IsString() level: string;

  /** 구매자 닉네임 */
  @IsString() nickname: string;

  /** 구매물품 이름 */
  @IsString() productName: string;

  /** 구매물품 가격 또는 수량 */
  @Type(() => Number) @IsNumber() purchaseNum: number;

  /** tts 세팅 */
  @IsEnum(TtsSetting) ttsSetting: TtsSetting = TtsSetting.full;

  /** 간략 메시지(닉네임을 알 수 없는 익명메시지) 여부 */
  @IsOptional() @IsBoolean() simpleMessageFlag?: boolean;

  /** 선물 구매 여부 */
  @IsOptional() @IsBoolean() giftFlag?: boolean;

  /** 라이브쇼핑 id */
  @IsNumber() liveShoppingId: number;
}

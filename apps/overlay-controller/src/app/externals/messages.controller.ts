import {
  Body,
  Controller,
  Inject,
  Logger,
  NotFoundException,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiHeaders,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { API_KEY_HEADER_KEY, MICROSERVICE_OVERLAY_TOKEN } from '@project-lc/nest-core';
import { ApiKeyGuard } from '@project-lc/nest-modules-authguard';
import { Observable } from 'rxjs';
import { ExternalBroadcastersService } from './broadcasters.service';
import {
  ExternalMessagesService,
  MessageRes,
  PurchaseMessageNormalDto,
} from './messages.service';

@UseGuards(ApiKeyGuard)
@ApiHeaders([{ name: API_KEY_HEADER_KEY, required: true, description: 'API_KEY' }])
@ApiExtraModels(PurchaseMessageNormalDto, MessageRes)
@Controller('broadcasters/:broadcaster/messages')
@ApiTags('messages')
export class ExternalMessagesController {
  private readonly logger = new Logger(ExternalMessagesController.name);
  constructor(
    @Inject(MICROSERVICE_OVERLAY_TOKEN) private readonly overlayService: ClientProxy,
    private readonly bcService: ExternalBroadcastersService,
    private readonly messagesService: ExternalMessagesService,
  ) {}

  @ApiOperation({
    summary: '방송인 오버레이 화면에 구매 메시지를 송출합니다.',
    description:
      '방송인이 라이브쇼핑중이라면 라이브쇼핑 오버레이에, 그렇지 않다면 상시 도네이션 오버레이에 구매 메시지를 송출합니다.',
  })
  @ApiParam({
    name: 'broadcaster',
    required: true,
    description: '방송인 명(`BroadcasterRes`의 `overlayUrl`필드에서 /를 제거한 값)',
    schema: { type: 'string', example: 'testbc@gmail.com' },
  })
  @ApiCreatedResponse({ description: '성공적으로 요청을 처리함.', type: MessageRes })
  @ApiBadRequestResponse({ description: '올바르지 못한 body가 요청됨.' })
  @ApiForbiddenResponse({ description: '올바르지 못한 apikey가 요청됨.' })
  @ApiNotFoundResponse({ description: '요청한 방송인을 찾을 수 없음.' })
  @Post()
  public async handleNormalPurchase(
    @Param('broadcaster') bc: string,
    @Body(new ValidationPipe({ transform: true })) data: PurchaseMessageNormalDto,
  ): Promise<Observable<MessageRes>> {
    // 방송인 조회
    const _bc = await this.bcService.getBroadcasterByEmail(bc);
    if (!_bc) throw new NotFoundException(`Broadcaster not found. ${bc}`);

    // 라이브쇼핑 조회 및 라이브쇼핑 중인지 확인
    const liveShopping = await this.bcService.getLastLiveShoppingByBroadcaster(_bc.id);
    const isLiveShoppingInLive = liveShopping
      ? this.bcService.isLiveShoppingInLive(liveShopping)
      : false;

    // 구매 메시지 전송
    if (isLiveShoppingInLive) {
      const dto = { ...data, liveShoppingId: liveShopping.id };
      return this.messagesService.sendLiveMessage(_bc.email, dto);
    }
    return this.messagesService.sendNormalMessage(_bc.email, data);
  }
}

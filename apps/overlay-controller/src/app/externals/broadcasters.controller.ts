import {
  Controller,
  Get,
  Logger,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiHeaders,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { API_KEY_HEADER_KEY } from '@project-lc/nest-core';
import { ApiKeyGuard } from '@project-lc/nest-modules-authguard';
import {
  ExternalBroadcastersService,
  GetBroadcasterDto,
  GetBroadcastersRes,
} from './broadcasters.service';

@UseGuards(ApiKeyGuard)
@ApiHeaders([{ name: API_KEY_HEADER_KEY, required: true, description: 'API_KEY' }])
@ApiExtraModels(GetBroadcasterDto, GetBroadcastersRes)
@Controller('broadcasters')
@ApiTags('broadcasters')
export class ExternalBroadcastersController {
  private readonly logger = new Logger(ExternalBroadcastersController.name);
  constructor(private readonly service: ExternalBroadcastersService) {}

  @Get()
  @ApiOperation({
    summary: '방송인 목록을 검색합니다.',
    description: [
      'query가 없는 경우, 페이징 처리된 방송인 목록을 조회합니다.',
      'query가 주어진 경우, query를 방송인 이름, 닉네임, 이메일에 대해 검색합니다.',
    ].join('\n\n'),
  })
  @ApiOkResponse({
    description: '성공적으로 요청을 처리함.',
    type: GetBroadcastersRes,
  })
  @ApiForbiddenResponse({ description: '올바르지 못한 apikey가 요청됨.' })
  public async getBroadcasters(
    @Query(new ValidationPipe({ transform: true })) reqQuery: GetBroadcasterDto,
  ): Promise<GetBroadcastersRes[]> {
    const { skip, take, query } = reqQuery;
    return this.service.getBroadcasters({ skip, take, query });
  }
}

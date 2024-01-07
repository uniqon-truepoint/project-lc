import { Controller, Get, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard, JwtAuthGuard } from '@project-lc/nest-modules-authguard';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('api-key')
@ApiTags('api-key')
export class ExternalApiKeyController {
  constructor(private readonly configService: ConfigService) {}

  @ApiOperation({
    summary:
      '이 키를 신중히 다루어 주세요. 다른 곳에 노출되지 않도록 각별히 유의 바랍니다.',
  })
  @ApiOkResponse({ description: '응답성공', schema: { type: 'string' } })
  @ApiForbiddenResponse({ description: '올바르지 못한 apikey가 요청됨.' })
  @Get()
  public getApiKey(): string {
    return this.configService.get('SERVER_API_KEY');
  }
}

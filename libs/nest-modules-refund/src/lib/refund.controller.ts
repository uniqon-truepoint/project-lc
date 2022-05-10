import { UseInterceptors, Controller, Get } from '@nestjs/common';
import { HttpCacheInterceptor } from '@project-lc/nest-core';
import { RefundService } from './refund.service';

@UseInterceptors(HttpCacheInterceptor)
@Controller('refund')
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @Get()
  test(): string {
    return 'refund test';
  }
}

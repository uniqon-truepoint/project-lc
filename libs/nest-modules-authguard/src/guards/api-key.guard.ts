import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { API_KEY_HEADER_KEY } from '@project-lc/nest-core';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);
  constructor(private readonly configService: ConfigService) {}

  private verifyApiKey(providedApiKey: string): boolean {
    const serverApiKey = this.configService.get('SERVER_API_KEY');
    return serverApiKey === providedApiKey;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest<Request>();
    const apiKey = req.headers[API_KEY_HEADER_KEY.toLowerCase()];
    if (!apiKey)
      throw new ForbiddenException(`${API_KEY_HEADER_KEY} header is not provided`);
    if (typeof apiKey !== 'string')
      throw new ForbiddenException('Invalid apiKey. api key must be string');

    this.logger.log(`execute apiKey validation. - apiKey:${apiKey}`);
    const isValid = this.verifyApiKey(apiKey);
    if (!isValid)
      throw new ForbiddenException(
        'Invalid apiKey. Cannot found such api key from server',
      );
    this.logger.log('apiKey validation successed.');
    return isValid;
  }
}

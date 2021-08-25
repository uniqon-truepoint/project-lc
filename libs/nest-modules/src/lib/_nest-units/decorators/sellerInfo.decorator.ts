import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UserProfileRes } from '@project-lc/shared-types';

/**
 * 요청으로부터 로그인된 유저 정보 데이터를 가져옵니다.
 * 로그인된 정보가 없거나 로그인된 정보가 방송인인 경우, UnauthorizedException 오류를 던집니다.
 * @주의 **UseGaurd(IsAuthGuard) 로 세션이 있는지 확인한 뒤에 사용하여야 더 안전합니다.**
 * @example
 * someControllerMethod(@Marketer() marketerSession: MarketerSession) {}
 * someControllerMethod(@Marketer() { marketerId }: MarketerSession) {}
 */
export const SellerInfo = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Express.Request>();
  if (request.user && request.user.type === 'seller') {
    return request.user as UserProfileRes;
  }
  throw new UnauthorizedException();
});

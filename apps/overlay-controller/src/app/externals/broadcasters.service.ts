import { Injectable, Logger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Broadcaster, LiveShopping, Prisma } from '@prisma/client';
import { PrismaService } from '@project-lc/prisma-orm';
import { DefaultPaginationDto } from '@project-lc/shared-types';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max } from 'class-validator';

export class GetBroadcasterDto extends DefaultPaginationDto {
  /**
   * 방송인 이름, 닉네임, 이메일 검색 키워드
   */
  @ApiProperty({
    type: 'string',
    description: '방송인 이름, 닉네임, 이메일 검색 키워드',
    example: '테스트',
    required: false,
  })
  @IsOptional()
  @IsString()
  query?: string;

  /** 목록조회시 skip할 데이터 개수 (page * size) */
  @ApiProperty({
    type: 'number',
    description: '목록조회시 skip할 데이터 개수 (page * size)',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  skip?: number;

  /** 목록조회시 조회 할 데이터 개수 (size) */
  @ApiProperty({
    type: 'number',
    description: '목록조회시 조회 할 데이터 개수 (size). 최대 100까지 가능.',
    default: '5',
    required: false,
  })
  @Max(100)
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  take?: number = 5;
}

export class GetBroadcastersRes {
  @ApiProperty({ type: 'number' }) id: number;
  @ApiProperty({ type: 'string', description: '유저 닉네임' }) userNickname: string;
  @ApiProperty({ type: 'string', description: '유저 오버레이 구분자 (/이메일)' })
  overlayUrl?: string;
}

@Injectable()
export class ExternalBroadcastersService {
  private readonly logger = new Logger(ExternalBroadcastersService.name);
  constructor(private readonly prisma: PrismaService) {}

  /** 방송인 목록 검색 */
  public async getBroadcasters(dto: GetBroadcasterDto): Promise<GetBroadcastersRes[]> {
    const { query, skip, take } = dto;
    const where: Prisma.BroadcasterFindManyArgs['where'] = { deleteFlag: false };
    if (query) {
      where.OR = [
        { userNickname: { contains: query } },
        { userName: { contains: query } },
        { overlayUrl: { contains: query } },
        { email: { contains: query } },
      ];
    }
    return this.prisma.broadcaster.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        userNickname: true,
        overlayUrl: true,
      },
    });
  }

  /** 이메일 기준 방송인 조회 */
  public async getBroadcasterByEmail(email: string): Promise<Broadcaster> {
    return this.prisma.broadcaster.findUnique({ where: { email } });
  }

  /** 방송인 기준 라이브쇼핑 조회 */
  public async getLastLiveShoppingByBroadcaster(
    broadcasterId: number,
    optoins?: any,
  ): Promise<LiveShopping> {
    return this.prisma.liveShopping.findFirst({
      where: { broadcasterId, progress: 'confirmed' },
      orderBy: { broadcastEndDate: 'desc' },
    });
  }

  public isLiveShoppingInLive(liveShopping: LiveShopping): boolean {
    const start = liveShopping.broadcastStartDate.getTime();
    const end = liveShopping.broadcastEndDate.getTime();
    const now = Date.now();
    return now >= start && now <= end;
  }
}

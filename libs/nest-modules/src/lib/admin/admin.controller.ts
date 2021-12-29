import {
  Body,
  Controller,
  DefaultValuePipe,
  ForbiddenException,
  Get,
  Header,
  Ip,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Administrator,
  BusinessRegistrationConfirmation,
  GoodsConfirmation,
  LiveShopping,
} from '@prisma/client';
import {
  AdminBroadcasterSettlementInfoList,
  AdminSellerListRes,
  AdminSettlementInfoType,
  AdminSignUpDto,
  BroadcasterDTO,
  BroadcasterSettlementInfoConfirmationDto,
  BusinessRegistrationConfirmationDto,
  BusinessRegistrationRejectionDto,
  ChangeSellCommissionDto,
  CreateManyBroadcasterSettlementHistoryDto,
  EmailDupCheckDto,
  ExecuteSettlementDto,
  FindBcSettlementHistoriesRes,
  GoodsByIdRes,
  GoodsConfirmationDto,
  GoodsRejectionDto,
  LiveShoppingDTO,
  OrderCancelRequestDetailRes,
  OrderCancelRequestList,
  SellerGoodsSortColumn,
  SellerGoodsSortDirection,
} from '@project-lc/shared-types';
import { Request } from 'express';
import { BroadcasterSettlementHistoryService } from '../broadcaster/broadcaster-settlement-history.service';
import { BroadcasterSettlementService } from '../broadcaster/broadcaster-settlement.service';
import { BroadcasterService } from '../broadcaster/broadcaster.service';
import { OrderCancelService } from '../order-cancel/order-cancel.service';
import { SellerSettlementService } from '../seller/seller-settlement.service';
import { SellerService } from '../seller/seller.service';
import { AdminGuard } from '../_nest-units/guards/admin.guard';
import { JwtAuthGuard } from '../_nest-units/guards/jwt-auth.guard';
import { AdminAccountService } from './admin-account.service';
import { AdminSettlementService } from './admin-settlement.service';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  private allowedIpAddresses: string[] = ['::1'];
  constructor(
    private readonly adminService: AdminService,
    private readonly broadcasterService: BroadcasterService,
    private readonly adminSettlementService: AdminSettlementService,
    private readonly adminAccountService: AdminAccountService,
    private readonly sellerSettlementService: SellerSettlementService,
    private readonly orderCancelService: OrderCancelService,
    private readonly bcSettlementHistoryService: BroadcasterSettlementHistoryService,
    private readonly broadcasterSettlementService: BroadcasterSettlementService,
    private readonly sellerService: SellerService,
    private readonly config: ConfigService,
  ) {
    const wtIp = config.get('WHILETRUE_IP_ADDRESS');
    if (wtIp) this.allowedIpAddresses.push(wtIp);
  }

  // * 관리자 회원가입
  @Post()
  public async signUp(
    @Req() req: Request,
    @Body(ValidationPipe) dto: AdminSignUpDto,
  ): Promise<Administrator> {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    if (!this.allowedIpAddresses.includes(ip)) {
      throw new ForbiddenException(`unexpected ip address - ${ip}`);
    }
    const administrator = await this.adminAccountService.signUp(dto);
    return administrator;
  }

  // * 이메일 주소 중복 체크
  @Get('email-check')
  public async emailDupCheck(
    @Query(ValidationPipe) dto: EmailDupCheckDto,
  ): Promise<boolean> {
    return this.adminAccountService.isEmailDupCheckOk(dto.email);
  }

  /** 판매자 정산 등록 정보 조회 */
  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  @Get('/settlement')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  getSettlementInfo(): Promise<AdminSettlementInfoType> {
    return this.adminService.getSettlementInfo();
  }

  /** 판매자 정산처리 */
  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  @Post('/settlement')
  executeSettle(@Body(ValidationPipe) dto: ExecuteSettlementDto): Promise<boolean> {
    if (dto.target.options.length === 0) return null;
    return this.sellerSettlementService.executeSettle(dto.sellerEmail, dto);
  }

  /** 판매자 정산 완료 목록 */
  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  @Get('/settlement-history')
  getSettlementHistory(): ReturnType<SellerSettlementService['findSettlementHistory']> {
    return this.sellerSettlementService.findSettlementHistory();
  }

  /** 방송인 단일 정산처리 */
  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  @Post('/settlement/broadcaster')
  async executeBcSettle(
    @Body(ValidationPipe) dto: CreateManyBroadcasterSettlementHistoryDto,
  ): Promise<number> {
    return this.bcSettlementHistoryService.executeSettleMany(dto);
  }

  /** 방송인 정산 완료 목록 조회 */
  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  @Get('/settlement-history/broadcaster')
  public async findBroadcasterSettlementHistoriesByRound(): Promise<FindBcSettlementHistoriesRes> {
    return this.bcSettlementHistoryService.findHistories();
  }

  /** 판매자 정산 기본 수수료 변경 */
  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  @Put('/sell-commission')
  updateSellCommission(
    @Body(ValidationPipe) dto: ChangeSellCommissionDto,
  ): Promise<boolean> {
    return this.adminService.updateSellCommission(dto.commissionRate);
  }

  // 상품검수를 위한 상품 리스트
  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  @Get('/goods')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getGoodsInfo(
    @Query('sort', new DefaultValuePipe(SellerGoodsSortColumn.REGIST_DATE))
    sort: SellerGoodsSortColumn,
    @Query('direction', new DefaultValuePipe(SellerGoodsSortDirection.DESC))
    direction: SellerGoodsSortDirection,
  ) {
    return this.adminService.getGoodsInfo({
      sort,
      direction,
    });
  }

  // 상품검수를 위한 상품 리스트
  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  @Get('/goods/:goodsId')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  getAdminGoodsById(@Param('goodsId') goodsId: string | number): Promise<GoodsByIdRes> {
    return this.adminService.getOneGoods(goodsId);
  }

  // 상품 검수 승인을 수행
  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  @Put('/goods/confirm')
  setGoodsConfirmation(@Body() dto: GoodsConfirmationDto): Promise<GoodsConfirmation> {
    return this.adminService.setGoodsConfirmation(dto);
  }

  // 상품 검수 반려를 수행
  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  @Put('/goods/reject')
  setGoodsRejection(@Body() dto: GoodsRejectionDto): Promise<GoodsConfirmation> {
    return this.adminService.setGoodsRejection(dto);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  @Get('/live-shoppings')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  getLiveShoppings(@Query('liveShoppingId') dto?: string): Promise<LiveShopping[]> {
    return this.adminService.getRegisteredLiveShoppings(dto || null);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  @Patch('/live-shopping')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async updateLiveShoppings(
    @Body() data: { dto: LiveShoppingDTO; videoUrlExist?: boolean },
  ): Promise<boolean> {
    let videoId;
    if (data.dto.videoUrl) {
      if (data.videoUrlExist) {
        await this.adminService.deleteVideoUrl(data.dto.id);
      }
      videoId = await this.adminService.registVideoUrl(data.dto.videoUrl);
    }
    return this.adminService.updateLiveShoppings(data.dto, videoId);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  @Get('/live-shopping/broadcasters')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  getAllBroadcasters(): Promise<BroadcasterDTO[]> {
    return this.broadcasterService.getAllBroadcasterIdAndNickname();
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  // 상품 검수 승인을 수행
  @Put('/business-registration/confirm')
  setBusinessRegistrationConfirmation(
    @Body() dto: BusinessRegistrationConfirmationDto,
  ): Promise<BusinessRegistrationConfirmation> {
    return this.adminSettlementService.setBusinessRegistrationConfirmation(dto);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  // 상품 검수 반려를 수행
  @Put('/business-registration/reject')
  setBusinessRegistrationRejection(
    @Body() dto: BusinessRegistrationRejectionDto,
  ): Promise<BusinessRegistrationConfirmation> {
    return this.adminSettlementService.setBusinessRegistrationRejection(dto);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  /** 결제취소 요청 목록 조회 */
  @Get('/order-cancel/list')
  getAllOrderCancelRequests(): Promise<OrderCancelRequestList> {
    return this.orderCancelService.getAllOrderCancelRequests();
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  /** 특정 주문에 대한 결제취소 요청 조회 */
  @Get('/order-cancel/:orderId')
  getOneOrderCancelRequest(
    @Param('orderId') orderId: string,
  ): Promise<OrderCancelRequestDetailRes> {
    return this.orderCancelService.getOneOrderCancelRequest(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  /** 특정 주문에 대한 결제취소 요청 상태 변경 */
  @Put('/order-cancel/:requestId')
  setOrderCancelRequestDone(
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<boolean> {
    return this.orderCancelService.setOrderCancelRequestDone(requestId);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  /** 방송인 정산등록정보 신청 목록 조회 */
  @Get('/settelment-info-list/broadcaster')
  getBroadcasterSettlementInfoList(): Promise<AdminBroadcasterSettlementInfoList> {
    return this.broadcasterSettlementService.getBroadcasterSettlementInfoList();
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  /** 방송인 정산정보 검수상태, 사유 수정 */
  @Patch('/settlement-info/broadcaster/confirmation')
  setBroadcasterSettlementInfoConfirmation(
    @Body()
    dto: BroadcasterSettlementInfoConfirmationDto,
  ): Promise<boolean> {
    return this.adminSettlementService.setBroadcasterSettlementInfoConfirmation(dto);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  /** 전체 판매자 계정 목록 조회 */
  @Get('/sellers')
  getSellerList(): Promise<AdminSellerListRes> {
    return this.sellerService.getSellerList();
  }
}

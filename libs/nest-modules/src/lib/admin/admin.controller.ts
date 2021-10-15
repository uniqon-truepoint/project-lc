import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Header,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  GoodsConfirmation,
  LiveShopping,
  BusinessRegistrationConfirmation,
} from '@prisma/client';
import {
  AdminService,
  GoodsByIdRes,
  GoodsConfirmationDto,
  GoodsRejectionDto,
  SellerGoodsSortColumn,
  SellerGoodsSortDirection,
  LiveShoppingDTO,
  BusinessRegistrationConfirmationDto,
  BusinessRegistrationRejectionDto,
  AdminSettlementInfoType,
} from '@project-lc/shared-types';
import { AdminGuard } from '../_nest-units/guards/admin.guard';
import { JwtAuthGuard } from '../_nest-units/guards/jwt-auth.guard';
import { BroadcasterService } from '../broadcaster/broadcaster.service';
import { AdminSettlementService } from './admin-settlement.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly broadcasterService: BroadcasterService,
    private readonly adminSettlementService: AdminSettlementService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  @Get('/settlement')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  getSettlementInfo(): Promise<AdminSettlementInfoType> {
    return this.adminService.getSettlementInfo();
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
  @Get('/live-shopping')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  getLiveShoppings(
    @Query('liveShoppingId') liveShoppingId?: string,
  ): Promise<LiveShopping[]> {
    return this.adminService.getRegisteredLiveShoppings(liveShoppingId);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  @Get('/live-shopping/broadcaster')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  getAllBroadcasters(): Promise<any> {
    return this.broadcasterService.getAllBroadcasterIdAndNickname();
  }

  // 상품 검수 승인을 수행
  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  @Put('/business-registration/confirm')
  setBusinessRegistrationConfirmation(
    @Body() dto: BusinessRegistrationConfirmationDto,
  ): Promise<BusinessRegistrationConfirmation> {
    return this.adminSettlementService.setBusinessRegistrationConfirmation(dto);
  }

  // 상품 검수 반려를 수행
  @UseGuards(JwtAuthGuard)
  @UseGuards(AdminGuard)
  @Put('/business-registration/reject')
  setBusinessRegistrationRejection(
    @Body() dto: BusinessRegistrationRejectionDto,
  ): Promise<BusinessRegistrationConfirmation> {
    return this.adminSettlementService.setBusinessRegistrationRejection(dto);
  }
}

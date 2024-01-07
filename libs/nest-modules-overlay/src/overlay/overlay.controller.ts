import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BroadcasterService } from '@project-lc/nest-modules-broadcaster';
import { LiveShoppingService } from '@project-lc/nest-modules-liveshopping';
import { Request, Response } from 'express';
import { OverlayService } from './overlay.service';

interface ImagesLengthAndUserId {
  verticalImagesLength: number;
  email: string;
  liveShoppingId: { id: number };
}

@Controller()
export class OverlayController {
  constructor(
    private readonly overlayService: OverlayService,
    private readonly broadcasterService: BroadcasterService,
    private readonly liveShoppingService: LiveShoppingService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 라이브 쇼핑 오버레이 렌더링 페이지
   * 오버레이 렌더링 시 필요한 정보들 받아오고, hbs로 넘겨줌
   * */
  @Get([':id', '/nsl/:id'])
  async getRender(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<ImagesLengthAndUserId> {
    const overlayUrl = id.startsWith('/') ? id : `/${id}`;
    try {
      const { id: broadcasterIdAndEmailId, email } =
        await this.broadcasterService.getBroadcasterEmail(overlayUrl);
      const liveShoppingId = await this.liveShoppingService.getLiveShoppingForOverlay(
        broadcasterIdAndEmailId,
      );
      const verticalImagesLength = await this.overlayService.getBannerImagesFromS3(
        { email },
        liveShoppingId.id,
        'vertical-banner',
      );
      const horizontalImagesLength = await this.overlayService.getBannerImagesFromS3(
        { email },
        liveShoppingId.id,
        'horizontal-banner',
      );

      const bucketName = this.configService.get('S3_BUCKET_NAME');
      const data = { verticalImagesLength, email, liveShoppingId, bucketName };
      const nslData = { horizontalImagesLength, email, liveShoppingId, bucketName };

      if (req.path.includes('/nsl')) {
        res.render('nsl-client', nslData);
      } else {
        res.render('client', data);
      }
      return data;
    } catch {
      res.render('404');
      return {
        verticalImagesLength: 0,
        email: '',
        liveShoppingId: { id: 0 },
      };
    }
  }

  /**
   * 상시 구매메시지 도네이션 오버레이 렌더링 페이지
   */
  @Get(':id/donation')
  async render(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    const data = { id };
    res.render('normal-donation', data);
    return data;
  }
}

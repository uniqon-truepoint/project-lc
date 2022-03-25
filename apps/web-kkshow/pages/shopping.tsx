import { Box } from '@chakra-ui/react';
import { kkshowFooterLinkList } from '@project-lc/components-constants/footerLinks';
import { CommonFooter } from '@project-lc/components-layout/CommonFooter';
import BottomQuickMenu from '@project-lc/components-shared/BottomQuickMenu';
import KkshowNavbar from '@project-lc/components-web-kkshow/KkshowNavbar';
import KKshowMainExternLinks from '@project-lc/components-web-kkshow/main/KKshowMainExternLinks';
import { ShoppingCarousel } from '@project-lc/components-web-kkshow/shopping/ShoppingCarousel';
import { ShoppingEventBanner } from '@project-lc/components-web-kkshow/shopping/ShoppingEventBanner';
import { ShoppingGoodsOfTheWeek } from '@project-lc/components-web-kkshow/shopping/ShoppingGoodsOfTheWeek';
import { ShoppingKeywords } from '@project-lc/components-web-kkshow/shopping/ShoppingKeywords';
import { ShoppingNewLineUp } from '@project-lc/components-web-kkshow/shopping/ShoppingNewLineUp';
import { ShoppingPopularGoods } from '@project-lc/components-web-kkshow/shopping/ShoppingPopularGoods';
import { ShoppingRecommendations } from '@project-lc/components-web-kkshow/shopping/ShoppingRecommendations';
import { ShoppingReviews } from '@project-lc/components-web-kkshow/shopping/ShoppingReviews';

export default function Shopping(): JSX.Element {
  return (
    <Box overflow="hidden" position="relative">
      <KkshowNavbar />
      <ShoppingCarousel />
      <ShoppingGoodsOfTheWeek />
      <ShoppingNewLineUp />
      <ShoppingPopularGoods />
      <ShoppingEventBanner />
      <ShoppingRecommendations />
      <ShoppingReviews />
      <ShoppingKeywords />

      <KKshowMainExternLinks mb={-4} bgColor="blue.900" color="whiteAlpha.900" />
      <CommonFooter footerLinkList={kkshowFooterLinkList} />
      <BottomQuickMenu />
    </Box>
  );
}

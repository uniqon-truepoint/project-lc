import {
  Broadcaster,
  Goods,
  GoodsCategory,
  GoodsConfirmation,
  GoodsImages,
  GoodsInfo,
  GoodsInformationNotice,
  GoodsInformationSubject,
  GoodsOptions,
  GoodsOptionsSupplies,
  LiveShopping,
  ProductPromotion,
  Seller,
  SellerShop,
  ShippingCost,
  ShippingGroup,
  ShippingOption,
  ShippingSet,
} from '@prisma/client';

export type GoodsRelatedBroadcaster = Pick<Broadcaster, 'id' | 'avatar' | 'userNickname'>;
export type GoodsByIdResBase = Goods & {
  options: (GoodsOptions & {
    supply: GoodsOptionsSupplies;
  })[];
  ShippingGroup:
    | (ShippingGroup & {
        shippingSets: Array<
          ShippingSet & {
            shippingOptions: Array<ShippingOption & { shippingCost: ShippingCost[] }>;
          }
        >;
      })
    | null;
  confirmation: GoodsConfirmation;
  image: GoodsImages[];
  GoodsInfo: GoodsInfo | null;
  LiveShopping?: Array<
    LiveShopping & {
      broadcaster: GoodsRelatedBroadcaster;
    }
  >;
  productPromotion: Array<
    ProductPromotion & {
      broadcaster: GoodsRelatedBroadcaster;
    }
  >;
  categories: GoodsCategory[];
  informationNotice: GoodsInformationNotice;
  informationSubject: GoodsInformationSubject;
};

export type GoodsByIdSellerInfo = {
  seller: Pick<Seller, 'avatar' | 'id' | 'name'> & {
    sellerShop?: {
      shopName: SellerShop['shopName'];
    };
  };
};
export type GoodsByIdRes = GoodsByIdResBase & GoodsByIdSellerInfo;

export type AdminGoodsByIdRes = GoodsByIdResBase & {
  seller: Seller;
};

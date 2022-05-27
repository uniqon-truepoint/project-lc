import {
  Broadcaster,
  Exchange,
  ExchangeImage,
  ExchangeItem,
  Export,
  ExportItem,
  Goods,
  GoodsImages,
  GoodsReview,
  Order,
  OrderCancellation,
  OrderCancellationItem,
  OrderItem,
  OrderItemOption,
  OrderItemSupport,
  OrderPayment,
  OrderShipping,
  Refund,
  Return,
  ReturnImage,
  ReturnItem,
  Seller,
} from '@prisma/client';

export type OrderItemSupportWithBroadcasterInfo = OrderItemSupport & {
  broadcaster: {
    userNickname: Broadcaster['userNickname'];
    avatar: Broadcaster['avatar'];
  };
};

export type OriginGoods = {
  id: Goods['id'];
  goods_name: Goods['goods_name'];
  image: GoodsImages[];
  sellerId: Seller['id'];
};

type Nullable<T> = T | null;

export type OrderItemWithRelations = OrderItem & {
  support: Nullable<OrderItemSupportWithBroadcasterInfo>;
  review?: { id: GoodsReview['id'] };
  options: OrderItemOption[];
  goods: OriginGoods;
};

export type OrderCancellationBaseData = OrderCancellation & {
  items: OrderCancellationItem[];
};
export type ExportBaseData = Export & { items: ExportItem[] };
export type ExchangeBaseData = Exchange & { exchangeItems: ExchangeItem[] };
export type ReturnBaseData = Return & { items: ReturnItem[] };
export type ReturnDataWithImages = ReturnBaseData & { images: ReturnImage[] };
export type ExchangeDataWithImages = ExchangeBaseData & { images: ExchangeImage[] };

export type OrderBaseData = Order & {
  orderItems: OrderItemWithRelations[];
  payment?: Nullable<OrderPayment>;
  refunds: Nullable<Refund[]>;
  shippings: (OrderShipping & { items: OrderItemOption[] })[];
};

export type OrderDataWithRelations = OrderBaseData & {
  orderCancellations?: Nullable<OrderCancellationBaseData[]>;
  exports: Nullable<ExportBaseData[]>;
  exchanges: Nullable<ExchangeBaseData[]>;
  returns: Nullable<ReturnBaseData[]>;
};

/** 주문 목록 리턴 데이터 타입 */
export type OrderListRes = {
  orders: OrderDataWithRelations[];
  count: number;
  nextCursor?: number; // infinite Query 에서 사용하기 위한 다음 skip 값
};

/** 주문 상세 리턴데이터 타입 -> 주문 완료 페이지 혹은 주문 상세 페이지 작업하면서 수정 필요
 */
export type OrderDetailRes = OrderBaseData & {
  orderCancellations?: Nullable<OrderCancellationBaseData[]>;
  exports: Nullable<ExportBaseData[]>;
  exchanges: Nullable<ExchangeDataWithImages[]>;
  returns: Nullable<ReturnDataWithImages[]>;
};

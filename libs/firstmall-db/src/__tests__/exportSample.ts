import { FmExport, FmExportItem } from '@project-lc/shared-types';

export const exportSample: FmExport = {
  export_seq: 2,
  export_code: 'D123456',
  status: '75',
  buy_confirm: 'none',
  confirm_date: null,
  order_seq: '20210826121234567',
  reserve_save: 'none',
  international: 'domestic',
  domestic_shipping_method: 'delivery',
  delivery_company_code: 'code0',
  delivery_number: '12313123131313212132',
  international_shipping_method: null,
  international_delivery_no: null,
  status_date: new Date('2021-08-26T03:10:43.000Z'),
  export_date: new Date('2021-08-25T15:00:00.000Z'),
  complete_date: new Date('2021-08-25T15:00:00.000Z'),
  regist_date: new Date('2021-08-26T03:10:43.000Z'),
  important: '0',
  shipping_date: new Date('2021-08-25T15:00:00.000Z'),
  account_gb: 'none',
  account_date: null,
  account_2round: '2',
  account_4round: '4',
  shipping_provider_seq: 1,
  invoice_send_yn: 'n',
  account_seq: null,
  socialcp_refund_day: '0',
  socialcp_confirm: 'none',
  socialcp_status: '1',
  socialcp_confirm_date: null,
  gf_seq: null,
  bundle_export_code: '',
  wh_seq: null,
  npay_export_date: null,
  npay_shipping_date: null,
  npay_flag_release: null,
  npay_order_id: null,
  shipping_group: '1_1_delivery',
  shipping_method: 'delivery',
  shipping_set_name: '택배',
  store_scm_type: null,
  shipping_address_seq: null,
  market_fail: null,
  talkbuy_export_date: null,
  talkbuy_shiping_date: null,
  talkbuy_order_id: null,
  recipient_user_name: 'recipient_user_name',
  recipient_phone: '--',
  recipient_cellphone: '010-9999-9999',
  recipient_zipcode: '99999',
  recipient_address: 'recipient_address',
  recipient_address_street: 'recipient_address_street',
  recipient_address_detail: '111',
  recipient_email: 'asdf@asdf.com',
  order_user_name: 'order_user_name',
  order_phone: '--',
  order_cellphone: '010-9999-9999',
  order_email: 'asdf@asdf.com',
  memo: '1. 배송메모 : ㅁㄴㅇㄹ,',
};

export const exportItemSample: FmExportItem[] = [
  {
    goods_name: 'test2',
    image: '/asdf.png',
    item_option_seq: 4,
    title1: '색상',
    option1: '그레이',
    color: '#dddddd',
    ea: 1,
    price: '1000.00',
    step: '75',
    order_seq: '123123123123',
  },
  {
    goods_name: 'test2',
    image: '/asdf.png',
    item_option_seq: 5,
    title1: '색상',
    option1: '화이트',
    color: '#fff',
    ea: 1,
    price: '100.00',
    step: '75',
    order_seq: '123123123123',
  },
];

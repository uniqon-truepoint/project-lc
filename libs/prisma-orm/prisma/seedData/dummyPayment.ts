import { OrderPayment } from '@prisma/client';
import dayjs = require('dayjs');

export const dummyPayments: OrderPayment[] = [
  {
    id: 1,
    method: 'card',
    orderId: 8,
    paymentKey: '20220614104151331pKmvWX',
    depositDate: new Date(),
    depositDoneFlag: false,
    account: null,
    depositor: null,
    depositSecret: null,
    depositDueDate: dayjs(new Date()).add(7, 'day').toDate(),
    depositStatus: null,
  },
  {
    id: 2,
    method: 'card',
    orderId: 7,
    paymentKey: '20220613140004196eUx-Ul',
    depositDate: new Date(),
    depositDoneFlag: false,
    account: null,
    depositor: null,
    depositSecret: null,
    depositDueDate: dayjs(new Date()).add(7, 'day').toDate(),
    depositStatus: null,
  },
  {
    id: 3,
    method: 'virtualAccount',
    orderId: 6,
    paymentKey: '20220516160437801fUqXGi',
    depositDate: new Date(),
    depositDoneFlag: false,
    account: null,
    depositor: null,
    depositSecret: 'DEPOSIT_SECRET_TEST1',
    depositDueDate: dayjs(new Date()).add(7, 'day').toDate(),
    depositStatus: 'WAITING',
  },
  {
    id: 4,
    method: 'virtualAccount',
    orderId: 5,
    paymentKey: '20220516154059927Mx-60e',
    depositDate: new Date(),
    depositDoneFlag: false,
    account: null,
    depositor: null,
    depositSecret: 'DEPOSIT_SECRET_TEST2',
    depositDueDate: dayjs(new Date()).add(7, 'day').toDate(),
    depositStatus: 'WAITING',
  },
  {
    id: 5,
    method: 'card',
    orderId: 4,
    paymentKey: '20220516144652907Hq1RMm',
    depositDate: new Date(),
    depositDoneFlag: false,
    account: null,
    depositor: null,
    depositSecret: null,
    depositDueDate: dayjs(new Date()).add(7, 'day').toDate(),
    depositStatus: null,
  },
  {
    id: 6,
    method: 'card',
    orderId: 3,
    paymentKey: '20220516141608459wupcUq',
    depositDate: new Date(),
    depositDoneFlag: false,
    account: null,
    depositor: null,
    depositSecret: null,
    depositDueDate: dayjs(new Date()).add(7, 'day').toDate(),
    depositStatus: null,
  },
  {
    id: 7,
    method: 'virtualAccount',
    orderId: 2,
    paymentKey: '20220516165920231XeWaOv',
    depositDate: new Date(),
    depositDoneFlag: false,
    account: null,
    depositor: null,
    depositSecret: 'DEPOSIT_SECRET_TEST3',
    depositDueDate: dayjs(new Date()).add(7, 'day').toDate(),
    depositStatus: 'WAITING',
  },
  {
    id: 8,
    method: 'card',
    orderId: 1,
    paymentKey: '20220613154618378F9hUFA',
    depositDate: new Date(),
    depositDoneFlag: false,
    account: null,
    depositor: null,
    depositSecret: null,
    depositDueDate: dayjs(new Date()).add(7, 'day').toDate(),
    depositStatus: null,
  },
];

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '@project-lc/prisma-orm';
import request from 'supertest';
import { NestApplication } from '@nestjs/core';
import { GoodsController } from './goods.controller';
import { GoodsService } from './goods.service';

describe('GoodsController', () => {
  let app: NestApplication;
  let controller: GoodsController;
  let service: GoodsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [GoodsService],
      controllers: [GoodsController],
    }).compile();

    controller = module.get<GoodsController>(GoodsController);
    service = module.get<GoodsService>(GoodsService);

    jest.spyOn(service, 'getGoodsList').mockImplementation(async () => {
      return {
        items: [],
        totalItemCount: 0,
        maxPage: 0,
        currentPage: 0,
        nextPage: null,
        prevPage: null,
      };
    });

    app = module.createNestApplication();
    app.init();
  });

  afterAll(async () => {
    if (app) app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /list ::getGoodsList', () => {
    it('should return 200', () => {
      request(app.getHttpServer()).get('/goods/list?email=test@email.com').expect(200);
    });
  });
});

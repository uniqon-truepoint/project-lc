import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheConfig, MICROSERVICE_OVERLAY_TOKEN } from '@project-lc/nest-core';
import { LiveShoppingModule } from '@project-lc/nest-modules-liveshopping';
import {
  OverlayControllerModule,
  OverlayThemeModule,
} from '@project-lc/nest-modules-overlay-controller';
import { PrismaModule } from '@project-lc/prisma-orm';
import { AuthModule } from '@project-lc/nest-modules-auth';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { validationSchema } from '../settings/config.validation';
import { AppController } from './app.controller';
import { AuthController } from './auth.contoller';
import { ExternalBroadcastersService } from './externals/broadcasters.service';
import { ExternalMessagesService } from './externals/messages.service';
import { ExternalMessagesController } from './externals/messages.controller';
import { ExternalBroadcastersController } from './externals/broadcasters.controller';
import { ExternalApiKeyController } from './externals/api-key.controller';

@Module({
  imports: [
    AuthModule.withoutControllers(),
    CacheModule.registerAsync({ isGlobal: true, useClass: CacheConfig }),
    PrismaModule,
    OverlayControllerModule,
    LiveShoppingModule.withoutControllers(),
    ConfigModule.forRoot({ isGlobal: true, validationSchema }),
    OverlayThemeModule.withoutControllers(),
    ClientsModule.register([
      {
        name: MICROSERVICE_OVERLAY_TOKEN,
        transport: Transport.REDIS,
        options: { url: process.env.MQ_REDIS_URL || 'redis://localhost:6399' },
      },
    ]),
  ],
  controllers: [
    AppController,
    AuthController,
    ExternalMessagesController,
    ExternalBroadcastersController,
    ExternalApiKeyController,
  ],
  providers: [ConfigService, ExternalBroadcastersService, ExternalMessagesService],
})
export class AppModule {}

import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { colorizedMorganMiddleware } from '@project-lc/nest-core';
import cookieParser from 'cookie-parser';
import { join } from 'path';

export class AppSetting {
  constructor(private readonly app: NestExpressApplication) {}

  public setSwaggerDocument(): void {
    const description = `Overlay 화면을 제어합니다.`;
    const config = new DocumentBuilder()
      .setTitle('Overlay Controller')
      .setDescription(description)
      .setVersion('1.0')
      .addTag('messages')
      .build();
    const document = SwaggerModule.createDocument(this.app, config);
    SwaggerModule.setup('api-docs', this.app, document);
  }

  public initialize(): void {
    this.app.useStaticAssets(join(__dirname, 'public'));
    this.app.useStaticAssets(join(__dirname, 'assets'));
    this.app.useStaticAssets(join(__dirname, 'lib'));
    this.app.setBaseViewsDir(join(__dirname, 'views'));

    this.app.use(cookieParser());
    this.app.setViewEngine('hbs');
    this.app.enableCors();
    this.app.use(colorizedMorganMiddleware);
  }
}

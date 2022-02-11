import { Module } from '@nestjs/common';
import { PrismaModule } from '@project-lc/prisma-orm';
import { MailModule } from '@project-lc/nest-modules-mail';
import { AppService } from './app.service';

@Module({
  imports: [PrismaModule, MailModule],
  providers: [AppService],
})
export class AppModule {}

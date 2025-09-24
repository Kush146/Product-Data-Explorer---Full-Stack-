import { Module,Controller, Get } from '@nestjs/common';
import { PrismaModule } from './db/prisma.module';
import { NavigationModule } from './navigation/navigation.module';
import { ProductsModule } from './products/products.module';
import { HistoryModule } from './history/history.module';
import { QueueModule } from './queue/queue.module';
import { ScrapeController } from './scrape/scrape.controller';
import { RootController } from './root.controller';
import { ThrottlerModule } from '@nestjs/throttler';

@Controller() class HealthController { @Get() ok() { return { ok: true }; } }


@Module({
  imports: [PrismaModule, NavigationModule, ProductsModule,  HistoryModule, QueueModule, ThrottlerModule.forRoot([{ ttl: 60, limit: 60 }])],
  controllers: [HealthController, ScrapeController, RootController],
})
export class AppModule {}

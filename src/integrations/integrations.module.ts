import { Module, forwardRef } from '@nestjs/common';
import { Bitrix24Module } from './bitrix24/bitrix24.module';
import { IntegrationsController } from './integrations.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    Bitrix24Module,
    forwardRef(() => ProductsModule), // Ensure ProductsService is available
],
  controllers: [IntegrationsController],
})
export class IntegrationsModule {}

import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Bitrix24Service } from './bitrix24.service';
import { ProductsModule } from '../../products/products.module';

@Module({
  imports: [
    HttpModule, 
    ConfigModule,
    forwardRef(() => ProductsModule), // Handle circular dependency with ProductsModule
],
  providers: [Bitrix24Service],
  exports: [Bitrix24Service],
})
export class Bitrix24Module {}

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductEntity } from './entities/product.entity';
// import { DocumentsModule } from '../documents/documents.module'; // To handle cascade deletes or checks

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity]),
    // forwardRef(() => DocumentsModule), // If DocumentsService needs ProductsService and vice-versa directly
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // Export if needed by other modules (e.g., DocumentsService, IntegrationsService)
})
export class ProductsModule {}

import { Module, forwardRef } from '@nestjs/common'; // Import forwardRef if needed
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentEntity } from './entities/document.entity';
import { ProductsModule } from '../products/products.module';
import { CustomGost34TypesModule } from '../custom-gost34-types/custom-gost34-types.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentEntity]),
    forwardRef(() => ProductsModule), // Use forwardRef if ProductsModule imports DocumentsModule or vice-versa to break circular dependency
    CustomGost34TypesModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService] // Export if other modules might need it
})
export class DocumentsModule {}

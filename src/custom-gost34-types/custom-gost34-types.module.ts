import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomGost34TypesService } from './custom-gost34-types.service';
import { CustomGost34TypesController } from './custom-gost34-types.controller';
import { CustomGost34TypeEntity } from './entities/custom-gost34-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomGost34TypeEntity])],
  controllers: [CustomGost34TypesController],
  providers: [CustomGost34TypesService],
  exports: [CustomGost34TypesService], // Export if needed by DocumentsService
})
export class CustomGost34TypesModule {}

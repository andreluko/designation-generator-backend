import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { DocumentsModule } from './documents/documents.module';
import { CustomGost34TypesModule } from './custom-gost34-types/custom-gost34-types.module';
import { IntegrationsModule } from './integrations/integrations.module';

// Entities need to be imported for TypeOrmModule.forRootAsync
import { UserEntity } from './users/entities/user.entity';
import { ProductEntity } from './products/entities/product.entity';
import { DocumentEntity } from './documents/entities/document.entity';
import { CustomGost34TypeEntity } from './custom-gost34-types/entities/custom-gost34-type.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      load: [configuration], 
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [UserEntity, ProductEntity, DocumentEntity, CustomGost34TypeEntity],
        synchronize: false, // IMPORTANT: Use migrations in production
        autoLoadEntities: true, // Can be used instead of explicit entities array
        logging: process.env.NODE_ENV !== 'production' ? ['query', 'error'] : ['error'],
        migrations: ['dist/migrations/*.js'], 
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    // Use forwardRef if circular dependencies arise between these modules
    ProductsModule, 
    DocumentsModule,
    CustomGost34TypesModule,
    IntegrationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

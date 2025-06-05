import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Загрузка переменных из .env файла из корневой директории проекта
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });


// Эта конфигурация используется CLI TypeORM для генерации и запуска миграций
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [path.resolve(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [path.resolve(__dirname, '../migrations/*{.ts,.js}')],
  synchronize: false, 
  logging: true,
});

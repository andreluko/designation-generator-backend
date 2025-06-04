import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Загрузка переменных из .env файла из корневой директории проекта
// __dirname будет .../designation-generator-backend/src/config когда запускается через ts-node
// или .../designation-generator-backend/dist/config когда запускается скомпилированный js
// Поэтому path.resolve(__dirname, '../../.env') или path.resolve(process.cwd(), '.env')
// process.cwd() обычно является корневой папкой проекта, откуда запускается npm script
dotenv.config({ path: path.resolve(process.cwd(), '.env') });


// Эта конфигурация используется CLI TypeORM для генерации и запуска миграций
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [path.join(process.cwd(), 'src/**/*.entity{.ts,.js}')], // Используем process.cwd() для надежности
  migrations: [path.join(process.cwd(), 'src/migrations/*{.ts,.js}')],
  synchronize: false, 
  logging: true,
});

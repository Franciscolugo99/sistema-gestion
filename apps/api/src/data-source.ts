import 'reflect-metadata';
import 'dotenv/config';

import { DataSource } from 'typeorm';
import { Product } from './products/product.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST || 'localhost',
  port: +(process.env.PG_PORT || 5432),
  username: process.env.PG_USER || 'sg_user',
  password: process.env.PG_PASSWORD || 'sg_pass',
  database: process.env.PG_DATABASE || 'sg_db',
  synchronize: false,   // usamos migraciones, no sync automático
  logging: true,
  entities: [Product],
  migrations: ['src/migrations/*.ts'],

  // 👇 esta línea es clave para que se permitan migraciones con `transaction = false`
  migrationsTransactionMode: 'none',
});

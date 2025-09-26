import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import 'dotenv/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST || 'db',   // 👈 en Docker, usar "db"
      port: +(process.env.PG_PORT || 5432),
      username: process.env.PG_USER || 'sg_user',
      password: process.env.PG_PASSWORD || 'sg_pass',
      database: process.env.PG_DATABASE || 'sg_db',
      autoLoadEntities: true,
      synchronize: false,                  // usamos migraciones
    }),
    ProductsModule,                        // 👈 importa el módulo
  ],
})
export class AppModule {}

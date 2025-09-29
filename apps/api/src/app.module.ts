import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import 'dotenv/config';

function num(v: string | undefined, d: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      // Usa PG_* si existen, sino DATABASE_*, y por defecto 'localhost'
      host:
        process.env.PG_HOST ??
        process.env.DATABASE_HOST ??
        'localhost',
      port: num(process.env.PG_PORT ?? process.env.DATABASE_PORT, 5432),
      username:
        process.env.PG_USER ??
        process.env.DATABASE_USER ??
        'postgres',
      password:
        process.env.PG_PASSWORD ??
        process.env.DATABASE_PASS ??
        'postgres',
      database:
        process.env.PG_DATABASE ??
        process.env.DATABASE_NAME ??
        'sistemagestion',
      autoLoadEntities: true,
      synchronize: false, // en dev podés poner true si aún no tenés migraciones
    }),
    ProductsModule,
  ],
})
export class AppModule {}

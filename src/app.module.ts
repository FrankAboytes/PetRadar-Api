import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { createCache } from 'cache-manager';
import { AuthModule } from './auth/auth.module';
import { PetsModule } from './pets/pets.module';
import { HealthModule } from './health/health.module';
import { LocationModule } from './location/location.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // SQL: PostgreSQL (sin PostGIS)
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get('DATABASE_URL');
        
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: false,
          };
        }
        
        // Fallback using individual env vars
        return {
          type: 'postgres',
          host: config.get('PGHOST', 'localhost'),
          port: parseInt(config.get('PGPORT', '5432'), 10),
          username: config.get('PGUSER', 'petuser'),
          password: config.get('PGPASSWORD', 'petpassword'),
          database: config.get('PGDATABASE', 'petradar_db'),
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),

    // NoSQL: MongoDB
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get('MONGO_URL', 'mongodb://localhost:27017/petradar_health'),
      }),
    }),

    // Redis Cache (opcional — usa memoria si no hay Redis)
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisUrl = config.get('REDIS_URL');
        
        // Si hay REDIS_URL, intentar Redis con fallback a memoria
        if (redisUrl) {
          try {
            // Dynamic import — solo carga redis si se necesita
            const { redisStore } = await import('cache-manager-redis-yet');
            const store = await redisStore({
              url: redisUrl,
              ttl: 60 * 1000,
              socket: {
                reconnectStrategy: (retries: number) => {
                  if (retries > 3) return false;
                  return Math.min(retries * 1000, 3000);
                },
                connectTimeout: 5000,
              },
            });
            console.log('✅ Redis conectado en', redisUrl);
            return { store, ttl: 60 * 1000 };
          } catch (err: any) {
            console.warn('⚠️  Redis no disponible:', err?.message || err);
            console.warn('   Usando cache en memoria');
          }
        }
        
        // Fallback: cache en memoria (no requiere Redis)
        console.log('ℹ️  Cache en memoria activado (sin Redis)');
        return {
          store: 'memory',
          ttl: 60 * 1000,
          max: 100,
        };
      },
    }),

    AuthModule,
    PetsModule,
    HealthModule,
    LocationModule,
  ],
})
export class AppModule {}


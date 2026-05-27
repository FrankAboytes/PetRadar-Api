import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { AuthModule } from './auth/auth.module';
import { PetsModule } from './pets/pets.module';
import { HealthModule } from './health/health.module';
import { LocationModule } from './location/location.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // SQL: PostgreSQL + PostGIS
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL', 'postgresql://petuser:petpassword@localhost:5432/petradar_db'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    // NoSQL: MongoDB
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get('MONGO_URL', 'mongodb://localhost:27017/petradar_health'),
      }),
    }),

    // Redis Cache (opcional — fallback si no hay Redis disponible)
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisUrl = config.get('REDIS_URL');
        
        // Si no hay REDIS_URL configurada, usar cache en memoria
        if (!redisUrl) {
          console.warn('⚠️  REDIS_URL no configurada → usando cache en memoria (no persiste)');
          console.warn('   Para Railway: agrega un servicio Redis y configura REDIS_URL');
          return { ttl: 60 * 1000, max: 100 };
        }
        
        // Intentar conectar a Redis, fallback a memoria si falla
        try {
          return {
            store: await redisStore({
              url: redisUrl,
              ttl: 60 * 1000,
              socket: {
                reconnectStrategy: (retries) => {
                  if (retries > 3) {
                    console.warn('⚠️  Redis no disponible despues de 3 intentos → cache en memoria');
                    return false;
                  }
                  return Math.min(retries * 1000, 3000);
                },
                connectTimeout: 5000,
              },
            }),
          };
        } catch (error) {
          console.warn('⚠️  Error conectando a Redis:', (error as any)?.message);
          console.warn('   La app funciona sin Redis (cache en memoria)');
          return { ttl: 60 * 1000, max: 100 };
        }
      },
    }),

    AuthModule,
    PetsModule,
    HealthModule,
    LocationModule,
  ],
})
export class AppModule {}

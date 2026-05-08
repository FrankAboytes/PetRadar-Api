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

    // Redis Cache
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          url: config.get('REDIS_URL', 'redis://localhost:6379'),
          ttl: 60 * 1000,
        }),
      }),
    }),

    AuthModule,
    PetsModule,
    HealthModule,
    LocationModule,
  ],
})
export class AppModule {}

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from './auth/auth.module';
import { PetsModule } from './pets/pets.module';
import { HealthModule } from './health/health.module';
import { LocationModule } from './location/location.module';
import { CorrelationMiddleware } from './common/correlation.middleware';

// TypeORM entities
import { User } from './auth/user.entity';
import { Pet } from './pets/pet.entity';
import { LostPet, FoundPet } from './pets/lost-found.entity';
import { Breed } from './breeds/breed.entity';
import { Notification } from './notifications/notification.entity';
import { LocationHistory } from './locations/location.entity';
import { CommunityReport } from './reports/report.entity';
import { Veterinary } from './veterinaries/veterinary.entity';

// Mongoose schemas
import { HealthRecord, HealthRecordSchema } from './health/health.schema';
import { ChatMessage, ChatMessageSchema } from './chat/chat.schema';
import { ActivityLog, ActivityLogSchema } from './activity/activity.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // SQL: PostgreSQL + PostGIS (12 entities)
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        entities: [User, Pet, LostPet, FoundPet, Breed, Notification, LocationHistory, CommunityReport, Veterinary],
        synchronize: true, // Auto-crea tablas en Railway
        ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
        extra: {
          max: 10,
          connectionTimeoutMillis: 10000,
        },
      }),
    }),

    // NoSQL: MongoDB (3 collections) — Atlas o local
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const mongoUrl = config.get('MONGO_URL');
        if (!mongoUrl) {
          console.error('❌ MONGO_URL no configurada');
          console.error('   Railway: agrega un servicio MongoDB o configura MONGO_URL');
          throw new Error('MONGO_URL es requerida para iniciar la aplicacion');
        }
        console.log('🔗 MongoDB:', mongoUrl.replace(/\/\/.*@/, '//***@'));
        return {
          uri: mongoUrl,
          retryAttempts: 5,
          retryDelay: 3000,
          connectTimeoutMS: 15000,
          serverSelectionTimeoutMS: 15000,
        };
      },
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HealthRecord, HealthRecordSchema } from './health.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: HealthRecord.name, schema: HealthRecordSchema }])],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}

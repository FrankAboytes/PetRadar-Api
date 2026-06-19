import { Module, Global } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { MetricsInterceptor } from '../common/metrics.interceptor';

@Global()
@Module({
  controllers: [MonitoringController],
  providers: [MetricsInterceptor],
  exports: [MetricsInterceptor],
})
export class MonitoringModule {}

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MetricsInterceptor } from '../common/metrics.interceptor';

@ApiTags('📊 Monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly metrics: MetricsInterceptor) {}

  @Get('metrics')
  @ApiOperation({ summary: 'RED Metrics: Rate, Errors, Duration por endpoint' })
  getMetrics() {
    return this.metrics.getMetrics();
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumen global de métricas del sistema' })
  getSummary() {
    return this.metrics.getSummary();
  }

  @Get('database')
  @ApiOperation({ summary: 'Métricas de base de datos' })
  getDatabaseMetrics() {
    return this.metrics.getDatabaseMetrics();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check completo del sistema' })
  getFullHealth() {
    return {
      status: 'ok',
      ...this.metrics.getSummary(),
      database: this.metrics.getDatabaseMetrics(),
    };
  }
}

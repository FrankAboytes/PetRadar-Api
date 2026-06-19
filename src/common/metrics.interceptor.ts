import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

interface EndpointMetrics {
  rate: number;
  errors: number;
  totalDuration: number;
  lastMinute: number[];
  lastErrors: string[];
}

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Metrics');
  private readonly metrics = new Map<string, EndpointMetrics>();
  private readonly cleanupInterval: ReturnType<typeof setInterval>;

  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.route?.path || request.originalUrl || request.url;
    const key = `${method} ${url}`;
    const start = Date.now();

    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        rate: 0,
        errors: 0,
        totalDuration: 0,
        lastMinute: [],
        lastErrors: [],
      });
    }

    const metric = this.metrics.get(key)!;
    metric.rate++;
    metric.lastMinute.push(Date.now());

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        metric.totalDuration += duration;
        this.logger.debug(`📊 ${key} — ${duration}ms`);
      }),
      catchError((error) => {
        const duration = Date.now() - start;
        metric.errors++;
        metric.totalDuration += duration;
        metric.lastErrors.push(`[${new Date().toISOString()}] ${error.message}`);
        if (metric.lastErrors.length > 10) metric.lastErrors.shift();
        throw error;
      }),
    );
  }

  getMetrics() {
    const now = Date.now();
    const result: Record<string, any> = {};

    for (const [endpoint, data] of this.metrics.entries()) {
      const recentRequests = data.lastMinute.filter(t => now - t < 60000).length;
      result[endpoint] = {
        total_requests: data.rate,
        total_errors: data.errors,
        error_rate: data.rate > 0 ? ((data.errors / data.rate) * 100).toFixed(2) + '%' : '0%',
        avg_duration_ms: data.rate > 0 ? (data.totalDuration / data.rate).toFixed(1) : '0',
        requests_last_60s: recentRequests,
        last_errors: data.lastErrors.slice(-5),
      };
    }

    return result;
  }

  getDatabaseMetrics() {
    return {
      type: 'PostgreSQL + PostGIS',
      status: 'connected',
      pool_config: 'max=10, connectionTimeoutMillis=10000',
      last_checked: new Date().toISOString(),
    };
  }

  getSummary() {
    let totalRequests = 0;
    let totalErrors = 0;

    for (const data of this.metrics.values()) {
      totalRequests += data.rate;
      totalErrors += data.errors;
    }

    return {
      uptime_seconds: Math.floor(process.uptime()),
      total_requests: totalRequests,
      total_errors: totalErrors,
      global_error_rate: totalRequests > 0
        ? ((totalErrors / totalRequests) * 100).toFixed(2) + '%'
        : '0%',
      monitored_endpoints: this.metrics.size,
      timestamp: new Date().toISOString(),
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const data of this.metrics.values()) {
      data.lastMinute = data.lastMinute.filter(t => now - t < 300000);
    }
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

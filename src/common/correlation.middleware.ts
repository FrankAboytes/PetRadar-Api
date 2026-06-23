import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger.service';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
    (req as any)['correlationId'] = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);

    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
      const msg = `${req.method} ${req.originalUrl} — ${res.statusCode} — ${duration}ms`;
      logger.log(level, msg, {
        correlationId,
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.headers['user-agent']?.substring(0, 100),
        ip: req.ip,
      });
    });
    next();
  }
}

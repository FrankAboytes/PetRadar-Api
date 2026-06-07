import { createLogger, format, transports } from 'winston';

const { combine, timestamp, json, printf } = format;

// 5 niveles de log según estándar RFC 5424
// error (0), warn (1), info (2), debug (3), verbose (4)
// ⚠️ NUNCA loguear: passwords, tokens JWT completos, API keys, PII

const logFormat = printf(({ level, message, timestamp, correlationId, ...meta }) => {
  return JSON.stringify({
    timestamp,
    level,
    correlationId,
    message,
    ...meta,
  });
});

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    logFormat,
  ),
  transports: [
    new transports.Console({
      format: combine(
        timestamp({ format: 'HH:mm:ss' }),
        format.colorize(),
        printf(({ level, message, correlationId, ...meta }) => {
          const ctx = correlationId ? `[${correlationId?.toString().substring(0, 8)}]` : '';
          return `${level} ${ctx} ${message}`;
        }),
      ),
    }),
    new transports.File({
      filename: 'logs/app-error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    new transports.File({
      filename: 'logs/app-combined.log',
      maxsize: 10485760,
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'logs/rejections.log' }),
  ],
});

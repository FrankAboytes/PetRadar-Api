import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { useAzureMonitor } from '@azure/monitor-opentelemetry';

// Cargar .env desde la raíz del proyecto
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function bootstrap() {
  // Azure Application Insights + Live Metrics (OpenTelemetry)
  const appInsightsKey = process.env.APPINSIGHTS_INSTRUMENTATIONKEY;
  console.log('🔑 AppInsights key:', appInsightsKey ? appInsightsKey.substring(0, 40) + '...' : 'NO ENCONTRADA');
  
  if (appInsightsKey) {
    try {
      useAzureMonitor({
        azureMonitorExporterOptions: { connectionString: appInsightsKey },
        enableLiveMetrics: true,
        enableStandardMetrics: true,
        enableTraceBasedSamplingForLogs: true,
      });
      console.log('📊 Application Insights + Live Metrics activado → petradar-incident-telemetry');
    } catch (err: any) {
      console.error('❌ AppInsights error:', err.message);
    }
  } else {
    console.log('⚠️ APPINSIGHTS_INSTRUMENTATIONKEY no configurada en .env');
  }

  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('PetRadar Pro API')
    .setDescription('🐾 Microservicios para gestión de mascotas, búsqueda geoespacial y monitoreo de salud')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log('🐾 PetRadar Pro API running on http://localhost:3000');
  console.log('📚 Swagger docs: http://localhost:3000/api/docs');
}
bootstrap();

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

  // ==================== CAMBIO AQUÍ ====================
  // 1. Railway inyecta de manera dinámica la variable PORT. Si no existe, usamos la 3000 para local.
  const port = process.env.PORT || 3000;
  
  // 2. Escuchamos en el host '0.0.0.0'. Esto le dice al contenedor que acepte peticiones externas 
  // entrantes directas de Railway en lugar de cerrarse solo a solicitudes locales (localhost).
  await app.listen(port, '0.0.0.0');
  
  console.log(`🐾 PetRadar Pro API running on port: ${port}`);
  console.log(`📚 Swagger docs disponible en /api/docs`);
  // =====================================================
}
bootstrap();
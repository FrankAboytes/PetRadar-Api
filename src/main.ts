import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as appInsights from 'applicationinsights';

async function bootstrap() {
  // Azure Application Insights
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .start();
    console.log('📊 Application Insights activado');
  }
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger docs
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

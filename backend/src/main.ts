import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend origin
  app.enableCors({
    origin: 'http://localhost:3001',
  });

  // Enable global validation pipes
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Enable global serialization
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Use global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Product Data Explorer API')
    .setDescription('REST API for product data exploration')
    .setVersion('1.0')
    .addTag('navigations')
    .addTag('categories')
    .addTag('products')
    .addTag('scraping')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

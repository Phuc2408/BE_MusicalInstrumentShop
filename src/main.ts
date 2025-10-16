import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; 
import { AuthResponse } from './auth/dto/auth-response.dto'; 
import { User } from './users/entities/user.entity'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    transform: true, 
  }));

  const config = new DocumentBuilder()
    .setTitle('Full Stack API Documentation')
    .setDescription('Documentation for all application endpoints, including authentication.')
    .setVersion('1.0')
    .addTag('Authentication')
    .addBearerAuth({ 
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
    }, 'jwt') 
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document); 

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
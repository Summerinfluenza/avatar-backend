import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { config } from 'dotenv';
import { LogLevel, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    // Values in the array can be any combination of 'log', 'fatal', 'error', 'warn', 'debug', and 'verbose'.

    const activeLogLevel: LogLevel[] = ['error', 'warn', 'fatal'];
    if (process.env.DEV == 'true') {
        activeLogLevel.push('debug');
    }
    if (process.env.LOGLVL_LOG == 'true') {
        activeLogLevel.push('log');
    }

    if (process.env.LOGLVL_DEBUG == 'true') {
        activeLogLevel.push('debug');
    }

    if (process.env.LOGLVL_VERBOSE == 'true') {
        activeLogLevel.push('verbose');
    }

    const app = await NestFactory.create(AppModule, {
        logger: activeLogLevel,
    });

    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type, Authorization',
        credentials: true, // Allow sending cookies across origins
    })

    app.useGlobalPipes(new ValidationPipe());

    const doc_config = new DocumentBuilder()
        .setTitle('Routes')
        .setDescription('A list over existing routes')
        .setVersion('1.0')
        .addTag('Auth')
        .addTag('Avatar')
        .addTag('Survey')
        .addTag('Response')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, doc_config);
    SwaggerModule.setup('', app, document);

    config(); // Load .env variables
    await app.listen(process.env.PORT);
}
bootstrap();

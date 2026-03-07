import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import serverlessExpress from '@vendia/serverless-express';
import { AppModule } from './app.module';
import { Handler, Context, Callback } from 'aws-lambda';

let cachedServer: Handler;

async function bootstrap() {
    if (!cachedServer) {
        const nestApp = await NestFactory.create(AppModule);

        nestApp.enableCors();
        nestApp.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }));
        nestApp.setGlobalPrefix('api');

        await nestApp.init();
        const expressApp = nestApp.getHttpAdapter().getInstance();
        cachedServer = serverlessExpress({ app: expressApp });
    }
    return cachedServer;
}

export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
    const server = await bootstrap();
    return server(event, context, callback);
};

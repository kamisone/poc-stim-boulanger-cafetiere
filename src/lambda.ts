import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverlessExpress from '@vendia/serverless-express';

let server: any;

async function bootstrap() {
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  await app.init();
  return serverlessExpress({ app: expressApp });
}

export const handler = async (event: any, context: any) => {
  server = server ?? (await bootstrap());
  return server(event, context);
};
 
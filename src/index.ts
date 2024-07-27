import express from 'express';
import { PrismaClient } from '@prisma/client';
import routes from './routes';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Express + TypeScript + Prisma + PostgreSQL');
});

export { app, prisma };

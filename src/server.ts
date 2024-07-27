import { app, prisma } from './index';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Ensure to disconnect Prisma client when the application terminates
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

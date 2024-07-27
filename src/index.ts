import express from "express";
import { PrismaClient } from "@prisma/client";
import routes from "./routes";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use("/api", routes);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "App API",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: "http://localhost:3000", // Change this to your server URL
      },
    ],
  },
  apis: ["./src/routes.ts"], // Update the path if needed
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("Express + TypeScript + Prisma + PostgreSQL");
});

export { app, prisma };

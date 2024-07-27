// swaggerOptions.ts
import swaggerJsDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node.js Express API',
      version: '1.0.0',
      description: 'API documentation for the Node.js Express application',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to your API docs
};

const specs = swaggerJsDoc(options);

export default specs;

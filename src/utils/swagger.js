import swaggerJSDoc from 'swagger-jsdoc';

// Basic swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'ScaleUp API',
    version: '1.0.0',
    description: 'API documentation for ScaleUp'
  },
  servers: [
    {
      url: ['http://localhost:3000',"https://api.scaleupbuild.org"],
      description: 'API server'
    }
  ]
};

const options = {
  swaggerDefinition,
  // Path to the API docs
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;

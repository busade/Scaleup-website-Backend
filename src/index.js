import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import logger from './utils/logger.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './utils/swagger.js';

import routes from './routes/index.js';
import connectDB from './utils/db.js';

const app = express();

// connect to database
connectDB();

// enable CORS
app.use(cors({
  origin: function(origin, callback){
  callback(null, true)}
}));

// HTTP request logging using morgan and winston
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// JSON body parsing
app.use(express.json());

// mount routes
app.use('/', routes);

// swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// basic error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});

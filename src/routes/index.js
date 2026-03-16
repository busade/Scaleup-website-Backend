import express from 'express';
import applicationRoutes from './applicationRoutes.js';
import contactRoutes from './contactRoutes.js';

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome message
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Returns a welcome message
 */
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to ScaleUp API' });
});

router.use('/api/applications', applicationRoutes);
router.use('/api', contactRoutes);

// health check endpoint

/**
 * @swagger
 * /components:
 *   get:
 *     summary: Health check endpoint
 *    tags: [General]
 *    responses:
 *      200:
 *       description: Returns a health check message
 *      500:
 *      description: Internal server error
 *     503:
 *      description: Service unavailable
 * 
 * This endpoint can be used by load balancers or monitoring tools to check if the server is running and healthy.
 * 
 * It returns a simple JSON message indicating that the server is healthy. If the server is not healthy, it can return a 500 or 503 status code to indicate an issue.
 * This is a common practice for APIs to provide a health check endpoint that can be used for monitoring and load balancing purposes.
 * The endpoint is defined as a GET request to /health, and it is tagged under "General" in the Swagger documentation.
 */
router.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

export default router;

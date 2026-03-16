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
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Returns a health check message
 */
router.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

export default router;

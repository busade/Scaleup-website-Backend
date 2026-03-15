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

export default router;

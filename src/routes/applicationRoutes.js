import express from 'express';
import { submitApplication } from '../controllers/applicationController.js';

const router = express.Router();

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Submit a volunteer application
 *     tags: [Applications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, phoneNumber, location, linkedIn, availability, whyVolunteer]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *               phoneNumber: { type: string }
 *               location: { type: string }
 *               linkedIn: { type: string }
 *               skills: { type: array, items: { type: string } }
 *               availability: { type: string }
 *               whyVolunteer: { type: string }
 *               relevantExperience: { type: string }
 *               cv: { type: string }
 *     responses:
 *       201:
 *         description: Submitted successfully
 *       400:
 *         description: Validation error
 */
router.post('/', submitApplication);

export default router;

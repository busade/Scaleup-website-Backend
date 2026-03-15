import express from 'express';
import { submitContact, submitWailist } from '../controllers/contactController.js';

const router = express.Router();

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Send a contact message
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, subject, message]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               subject: { type: string }
 *               message: { type: string }
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Validation error
 */
router.post('/contact', submitContact);



/**
 * @swagger
 * /api/waitlist:
 *   post:
 *     summary: Add email to waitlist
 *     tags: [Waitlist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       201:
 *         description: Email added to waitlist successfully
 *       400:
 *         description: Validation error
 */
router.post('/waitlist', submitWailist);

export default router;

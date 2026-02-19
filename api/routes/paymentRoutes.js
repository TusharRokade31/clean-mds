// api/routes/paymentRoutes.js
import express from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { webhookController } from '../controllers/webhookController.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();

// Payment routes
router.post('/phonepe/initiate', paymentController.initiatePhonePePayment);
router.get('/phonepe/status/:merchantTransactionId', paymentController.checkPaymentStatus);
router.post('/phonepe/refund/:bookingId', paymentController.processRefund);
router.get('/', paymentController.getAllPayments);
router.get('/my-payments', paymentController.getSelfPayments);
router.get('/phonepe/callback', paymentController.phonePeCallback);

// Webhook routes (no authentication)
router.post('/phonepe/webhook', webhookController.handlePhonePeWebhook);
router.post('/phonepe/webhook/refund', webhookController.handlePhonePeRefundWebhook);

export default router;
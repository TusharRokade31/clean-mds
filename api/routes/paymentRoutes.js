// api/routes/paymentRoutes.js
import express from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { webhookController } from '../controllers/webhookController.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();

// Payment routes
router.post('/phonepe/initiate', authorize, paymentController.initiatePhonePePayment);
router.get('/phonepe/status/:merchantTransactionId', authorize, paymentController.checkPaymentStatus);
router.post('/phonepe/refund/:bookingId', authorize, paymentController.processRefund);
router.get('/', authorize, paymentController.getAllPayments);
router.get('/my-payments', authorize, paymentController.getSelfPayments);

// Webhook routes (no authentication)
router.post('/phonepe/webhook', webhookController.handlePhonePeWebhook);
router.post('/phonepe/webhook/refund', webhookController.handlePhonePeRefundWebhook);

export default router;
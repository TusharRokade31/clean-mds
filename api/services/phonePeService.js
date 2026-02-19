// api/services/phonePeService.js
import {
  StandardCheckoutClient,
  Env,
  MetaInfo,
  CreateSdkOrderRequest
} from "pg-sdk-node";
import { randomUUID } from "crypto";
import crypto from "crypto";

// Initialize client ONCE at module level
const client = StandardCheckoutClient.getInstance(
  process.env.PHONEPE_CLIENT_ID,
  process.env.PHONEPE_CLIENT_SECRET,
  Number(process.env.PHONEPE_CLIENT_VERSION),
  Env.PRODUCTION  // Test Mode = SANDBOX
);

const phonePeService = {
  /**
   * Initiate a payment via PhonePe StandardCheckout
   */
  initiatePayment: async (paymentData) => {
    const { bookingId, amount, phone, userId } = paymentData;

    try {
      const merchantOrderId = randomUUID();

      // Convert ₹ to paise
      const amountInPaise = Math.round(amount * 100);

      const metaInfo = MetaInfo.builder()
        .udf1(userId || "")
        .udf2(bookingId || "")
        .udf3(phone || "")
        .build();

      const request = CreateSdkOrderRequest.StandardCheckoutBuilder()
        .merchantOrderId(merchantOrderId)
        .amount(amountInPaise)
        .metaInfo(metaInfo)
        .redirectUrl(
          `${process.env.API_PRO_URL}/payments/phonepe/callback?merchantTransactionId=${merchantOrderId}`
        )
        .expireAfter(3600)
        .build();

      const response = await client.pay(request);

      return {
        merchantTransactionId: merchantOrderId,
        paymentUrl: response.redirectUrl
      };
    } catch (error) {
      console.error("PhonePe initiatePayment error:", error);
      throw new Error(error.message || "Payment initiation failed");
    }
  },

  /**
   * Verify callback checksum from PhonePe
   * PhonePe sends: x-verify = SHA256(base64EncodedResponse + saltKey) + ### + saltIndex
   */
  verifyCallback: (xVerify, base64Response) => {
    try {
      if (!xVerify || !base64Response) return false;

      const [receivedHash, saltIndex] = xVerify.split("###");
      const saltKey = process.env.PHONEPE_SALT_KEY;

      const computedHash = crypto
        .createHash("sha256")
        .update(base64Response + saltKey)
        .digest("hex");

      return computedHash === receivedHash;
    } catch (error) {
      console.error("PhonePe verifyCallback error:", error);
      return false;
    }
  },

  /**
   * Check payment status by merchantOrderId
   */
  checkPaymentStatus: async (merchantTransactionId) => {
    try {
      const response = await client.getOrderStatus(merchantTransactionId);

      return {
        code: response.state === "COMPLETED" ? "PAYMENT_SUCCESS"
            : response.state === "FAILED"    ? "PAYMENT_ERROR"
            : "PAYMENT_PENDING",
        message: response.state,
        data: {
          transactionId: response.transactionId || merchantTransactionId,
          amount: response.amount ? response.amount / 100 : null, // convert paise back to ₹
          state: response.state,
          raw: response
        }
      };
    } catch (error) {
      console.error("PhonePe checkPaymentStatus error:", error);
      throw new Error(error.message || "Failed to check payment status");
    }
  },

  /**
   * Process refund for a completed payment
   */
  processRefund: async (refundData) => {
    const { bookingId, originalTransactionId, amount } = refundData;

    try {
      const refundOrderId = randomUUID();
      const amountInPaise = Math.round(amount * 100);

      // pg-sdk-node refund call
      const response = await client.refund({
        merchantOrderId: refundOrderId,
        originalTransactionId,
        amount: amountInPaise,
        callbackUrl: `${process.env.BACKEND_URL}/api/payments/phonepe/refund-callback`
      });

      return {
        refundOrderId,
        status: response.state || "INITIATED",
        raw: response
      };
    } catch (error) {
      console.error("PhonePe processRefund error:", error);
      throw new Error(error.message || "Refund failed");
    }
  }
};

export default phonePeService;
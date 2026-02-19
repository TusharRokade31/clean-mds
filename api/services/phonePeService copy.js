import {
  StandardCheckoutClient,
  Env,
  MetaInfo,
  CreateSdkOrderRequest
} from "pg-sdk-node";
import { randomUUID } from "crypto";

// Initialize ONCE (not inside function)
const client = StandardCheckoutClient.getInstance(
  process.env.PHONEPE_CLIENT_ID,
  process.env.PHONEPE_CLIENT_SECRET,
  Number(process.env.PHONEPE_CLIENT_VERSION),
  Env.SANDBOX // change to Env.PRODUCTION in live
);

/**
 * Create PhonePe Payment
 * @param {number} amountInRupees
 * @param {string} userId
 */
export const createPayment = async (paymentData) => {
    const { bookingId, amountInRupees, phone, userId } = paymentData;
  try {
    const merchantOrderId = randomUUID();

    // Convert ₹ to paise
    const amount = amountInRupees * 100;

    const metaInfo = MetaInfo.builder()
      .udf1(userId) // store userId
      .udf2(bookingId) // store bookingId
      .udf3(phone) // store phone number
      .build();

    const request = CreateSdkOrderRequest.StandardCheckoutBuilder()
      .merchantOrderId(merchantOrderId)
      .amount(amount)
      .metaInfo(metaInfo)
      .redirectUrl(`http://localhost:3000/payment/verify?merchantTransactionId=${merchantOrderId}`)
      .expireAfter(3600)
      .build();

    const response = await client.pay(request);

    return {
      success: true,
      merchantOrderId,
      checkoutUrl: response.redirectUrl
    };

  } catch (error) {
    console.error("PhonePe Error:", error);
    throw new Error("Payment initiation failed");
  }
};

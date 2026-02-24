
import React from 'react'
import "../policy.css"

export const metadata = {
    title: "Secure Booking & Payment | Peace of Mind Guaranteed",
    description: "Book your spiritual stays worry-free. My Divine Stays ensures fully secure payments, complete privacy, and trusted protection for every transaction.",
    alternates: {
        canonical: "https://mydivinestays.com/payment-security",
      },
};

const page = () => {
  return (
     <div className='legal-container legal-content my-24 px-20'><p>At My Divine Stays, payment safety and transparency are taken very seriously. We understand that both pilgrims and the dharamshala management need complete confidence while using an online booking platform.</p>
<p>All payments made on My Divine Stays are processed through <strong>secure, trusted payment gateways</strong> that follow industry-standard security protocols. This ensures that sensitive payment details such as card numbers, UPI IDs, and bank information are never stored on our servers.</p>
<p>Every transaction is <strong>encrypted </strong>and protected using advanced security measures, so your payment information remains private and safe at all times.</p>
<p>Once a booking is completed, pilgrims receive a <strong>clear booking confirmation</strong>, and dharamshalas receive accurate booking details for verification. This maintains transparency on both sides and avoids confusion or misuse.</p>
<p>My Divine Stays acts only as a <strong>technology platform</strong> that facilitates bookings and payments. We do not collect or misuse any personal or financial data beyond what is required to complete the booking securely.</p>
<p><strong>Cancellation &amp; Refund Policy:</strong></p>
<p>We understand that plans can change. Therefore, we offer the following cancellation policy to ensure fairness for both pilgrims and the dharamshala authorities:</p>
<ul>
<li>Cancelling more than 3 days before check-in: 90% refund.</li>
<li>Cancelling 3 days before check-in: 50% refund.</li>
<li>Cancelling within 24 hours of check-in: 0% refund.</li>
</ul>
<p>If you ever have a question or concern regarding a payment, our support team is always available to assist you.</p>
<p><em>My Divine Stays does not operate or manage any dharamshala. We only provide a secure online booking system to simplify reservations.</em></p>
{/* <h3>Refund Policy</h3>
<p>All bookings are final. No refunds will be issued once a booking is confirmed, even in case of cancellation.</p> */}
</div>
  )
}

export default page
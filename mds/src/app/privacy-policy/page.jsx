import React from 'react'
import "../policy.css"

export const metadata = {
    title: "Privacy Policy | Your Data Fully Protected & Secure",
    description: "Protect your personal data while booking spiritual stays. My Divine Stays keeps your information secure, private, and fully protected online.",
    alternates: {
        canonical: "https://mydivinestays.com/privacy-policy",
    },
};

const page = () => {
  return (
    <div className='legal-container my-24 px-20 legal-content'>
        <h1><strong>Privacy Policy – Protecting Your Data for Spiritual Stays</strong></h1>
        <p>At My Divine Stays, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website and services.</p>
        <h2>Information We Collect</h2>
        <p>When you use My Divine Stays, we may collect basic information such as:</p>
        <ul>
            <li>Name, phone number, and email address</li>
        </ul>
        <ul>
            <li>Booking details like dates, location, and the dharamshala name</li>
        </ul>
        <ul>
            <li>Payment-related details required to complete a transaction (processed securely via payment gateways)</li>
        </ul>
        <p>We do <strong>not </strong>store your card, UPI, or bank details on our servers.</p>

        <h2>How We Use Your Information</h2>
        <p>Your information is used only to:</p>
        <ul>
            <li>Process bookings and payments</li>
        </ul>
        <ul>
            <li>Share booking details with the selected dharamshala</li>
        </ul>
        <ul>
            <li>Send booking confirmations and important updates</li>
        </ul>
        <ul>
            <li>Provide customer support when required</li>
        </ul>
        <p>We do <strong>not </strong>sell, rent, or misuse your personal information.</p>
        <h2>Payment &amp; Data Security</h2>
        <p>All payments on My Divine Stays are processed through <strong>secure and trusted payment gateways</strong>.</p>
        <p>Your data is protected using standard security practices to prevent unauthorised access, loss, or misuse.</p>
        <h2>Sharing of Information</h2>
        <p>Your information is shared only with:</p>
        <ul>
            <li>The dharamshala you choose to book with (for booking confirmation)</li>
        </ul>
        <ul>
            <li>Payment gateway partners (only for transaction processing)</li>
        </ul>
        <ul>
            <li>Legal or regulatory authorities, if required by law</li>
        </ul>
        <p>We <strong>never </strong>share your data with third parties for marketing purposes.</p>
        <h2>Cookies &amp; Website Usage</h2>
        <p>My Divine Stays may use cookies to improve website functionality and user experience. Cookies help us understand website traffic and usage patterns, but do not collect sensitive personal information.</p>
        <p>You can manage or disable cookies through your browser settings.</p>

        <h2>Your Rights &amp; Choices</h2>
        <p>You have the right to:</p>
        <ul>
            <li>Access or update your personal information</li>
        </ul>

        <ul>
            <li>Request deletion of your data (subject to legal and booking requirements)</li>
        </ul>
        <ul>
            <li>Contact us for any privacy-related concerns</li>
        </ul>
        <h2>Cancellation & Refund Policy</h2>
        <p>We understand that plans can change. Therefore, we offer the following cancellation policy to ensure fairness for both pilgrims and the dharamshala authorities:</p>
        <ul>
            <li>Cancelling more than 3 days before check-in: 90% refund.</li>
            <li>Cancelling 3 days before check-in: 50% refund.</li>
            <li>Cancelling within 24 hours of check-in: 0% refund.</li>
        </ul>
        <h2>Third-Party Links</h2>
        <p>Our website may contain links to third-party websites. My Divine Stays is not responsible for the privacy practices of external sites. We encourage users to review their privacy policies separately.</p>

        <h2>Policy Updates</h2>
        <p>This Privacy Policy may be updated from time to time. Any changes will be reflected on this page with an updated effective date.</p>

        <h2>Contact Us</h2>
        <p>If you have any questions or concerns about this Privacy Policy, you can contact us at:</p>
        <p>📧 Email: mydivinestay@gmail.com</p>
        <p>📞 Phone / WhatsApp: +91 9819719930</p>

        <p><em>My Divine Stays is a technology platform that enables online bookings for verified dharamshalas. We do not own or operate any dharamshala.</em></p>
    </div>
  )
}

export default page
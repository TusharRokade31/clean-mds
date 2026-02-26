import React from 'react'
import "../policy.css"



export const metadata = {
    title: "Terms of Service | Rules You Must Know Before Booking",
    description: "Know your rights and responsibilities before booking. Read My Divine Stays Terms of Service for clear guidelines to stay secure and avoid surprises.",
    alternates: {
        canonical: "https://mydivinestays.com/terms-of-service",
      },
};


const page = () => {
  return (
<div  className='legal-container legal-content my-24 px-20'>
<h1><strong>Terms of Service – Rules for Secure Booking</strong></h1>
<p>Welcome to My Divine Stays. By accessing or using our website, you agree to comply with these Terms of Service. If you do not agree with any part of these terms, we request that you discontinue using the platform.</p>
<h3><strong>About My Divine Stays</strong></h3>
<p>My Divine Stays is an <strong>online booking platform</strong> designed to help pilgrims discover and book verified dharamshalas.<br />We act only as a <strong>technology facilitator</strong> and do not own, manage, or operate any dharamshala listed on the platform.</p>
<h3><strong>Use of the Platform</strong></h3>
<p>You agree to use My Divine Stays:</p>
<ul>
<li>Only for genuine booking or listing purposes</li>
<li>In a lawful and respectful manner</li>
<li>Without attempting to misuse, disrupt, or harm the platform</li>
</ul>
<p>Providing false information or engaging in misuse may result in restricted access.</p>
<h3><strong>Bookings &amp; Listings</strong></h3>
<ul>
<li>All dharamshala details, pricing, rules, and availability are provided by the respective dharamshala</li>
<li>Booking confirmations are generated only after successful payment</li>
<li>My Divine Stays does not guarantee availability or service quality</li>
</ul>
<p>Any stay-related experience is the responsibility of the dharamshala.</p>
<h3><strong>Payments</strong></h3>
<ul>
<li>Payments are handled through secure third-party payment gateways</li>
<li>My Divine Stays does not store sensitive financial information</li>
<li>Transaction success depends on the payment gateway and user bank/provider</li>
</ul>

<h3>Cancellation & Refund Policy</h3>
<p>We understand that plans can change. Therefore, we offer the following cancellation policy to ensure fairness for both pilgrims and the dharamshala authorities:</p>
<ul>
<li>Cancelling more than 3 days before check-in: 90% refund.</li>
<li>Cancelling 3 days before check-in: 50% refund.</li>
<li>Cancelling within 24 hours of check-in: 0% refund.</li>
</ul>
<h3><strong>User Conduct at Dharamshalas</strong></h3>
<p>Users are expected to:</p>
<ul>
<li>Follow dharamshala rules and traditions</li>
<li>Maintain respectful behaviour</li>
<li>Take responsibility for personal belongings</li>
</ul>
<p>Any misconduct is handled directly by the dharamshala authorities.</p>
<h3><strong>Limitation of Responsibility</strong></h3>
<p>My Divine Stays is not responsible for:</p>
<ul>
<li>Cleanliness, facilities, or services at the dharamshala</li>
<li>Disputes between pilgrims and the dharamshala management</li>
<li>Losses caused by delays, cancellations, or third-party services</li>
</ul>
<p>Our role is limited to providing a booking interface.</p>
<h3><strong>Intellectual Property</strong></h3>
<p>All website content, branding, and materials belong to My Divine Stays and may not be reused without permission.</p>
<h3><strong>Changes to Terms</strong></h3>
<p>We may update these Terms of Service at any time. Continued use of the platform indicates acceptance of updated terms.</p>
<h3><strong>Governing Law</strong></h3>
<p>These terms are governed by the laws of India. Any disputes will fall under Indian jurisdiction.</p>
<h3><strong>Contact &amp; Support</strong></h3>
<p>For questions related to these Terms of Service:</p>
<p>📧 Email: mydivinestay@gmail.com<br />📞 Phone / WhatsApp: +91 9819719930</p>
<p><em>My Divine Stays provides a digital booking platform only. Accommodation services are offered independently by listed dharamshalas.</em></p>
{/* <h3>Refund Policy</h3>
<p>All bookings are final. No refunds will be issued once a booking is confirmed, even in case of cancellation.</p> */}
</div>
  )
}

export default page
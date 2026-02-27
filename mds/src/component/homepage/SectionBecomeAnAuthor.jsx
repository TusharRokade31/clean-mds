import React from 'react'
import {
  CheckBadgeIcon,
  DocumentTextIcon,
  ClockIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    title: 'Verified Properties',
    description:
      'All dharamshalas are personally verified for cleanliness, safety, and spiritual ambiance',
    icon: CheckBadgeIcon,
    iconBg: 'bg-green-100 text-green-600',
  },
  // {
  //   title: 'GST Bills',
  //   description:
  //     'Transparent pricing with proper GST invoices for all your bookings',
  //   icon: DocumentTextIcon,
  //   iconBg: 'bg-blue-100 text-blue-600',
  // },
  // {
  //   title: '24x7 Support',
  //   description:
  //     'Round-the-clock customer support for any assistance during your spiritual journey',
  //   icon: ClockIcon,
  //   iconBg: 'bg-purple-100 text-purple-600',
  // },
  {
    title: 'UPI Payments',
    description:
      'Secure and convenient payments via UPI, cards, and digital wallets',
    icon: CreditCardIcon,
    iconBg: 'bg-yellow-100 text-yellow-600',
  },
]

export default function SectionBecomeAnAuthor() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-league-spartan font-bold text-center">
          Why Choose My Divine Stays?
        </h2>
        <p className="mt-2 text-center text-gray-600 font-alice">
          Trust indicators that make your spiritual journey safe and blessed
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${feature.iconBg}`}
              >
                <feature.icon className="w-6 h-6" aria-hidden="true" />
              </div>

              <h3 className="mt-4 text-lg font-semibold font-league-spartan text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-600 font-alice text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

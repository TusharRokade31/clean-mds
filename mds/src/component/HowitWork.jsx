import React from 'react'
import {
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  BuildingLibraryIcon,
  HandRaisedIcon,
} from '@heroicons/react/24/outline'

const steps = [
  {
    number: 1,
    title: 'Search',
    description:
      'Find verified dharamshalas and spiritual accommodations near your chosen temple or pilgrimage site',
    icon: MagnifyingGlassIcon,
  },
  {
    number: 2,
    title: 'Book',
    description:
      'Secure your stay with instant booking, GST bills, and multiple payment options including UPI',
    icon: CalendarDaysIcon,
  },
  {
    number: 3,
    title: 'Stay',
    description:
      'Enjoy comfortable, clean, and spiritually enriching accommodations with 24x7 support',
    icon: BuildingLibraryIcon,
  },
  {
    number: 4,
    title: 'Blessings',
    description:
      'Complete your spiritual journey with peace of mind and divine blessings',
    icon: HandRaisedIcon,
  },
]

export default function SectionHowItWork() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-league-spartan font-bold text-center">
          How It Works?
        </h2>
        <p className="mt-2 text-center text-gray-600 font-alice">
          Your spiritual journey made simple in four easy steps
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step) => (
            <div
			
              key={step.number}
              className="flex group [perspective:1000px] cursor-pointer flex-col items-center text-center"
            >
              <div className="">
                <div className="relative w-24 h-24 [transform-style:preserve-3d] transition-transform duration-500 group-hover:[transform:rotateY(180deg)]">
                  {/* Front (number) */}
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[#1035ac] text-white text-2xl font-bold [backface-visibility:hidden]">
                    {step.number}
                  </div>
                  {/* Back (icon) */}
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white text-[#1035ac] [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <step.icon className="w-8 h-8" aria-hidden="true" />
                  </div>
                </div>
              </div>

              <h3 className="mt-4 text-lg font-league-spartan font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="mt-2 text-gray-600 font-alice text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

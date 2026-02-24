
import Image from "next/image"
import React from 'react'
import {
  PhoneIcon,
  ChatBubbleLeftEllipsisIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'



export const metadata = {
    title: "About My Divine Stays – Spiritual Journeys",
    description: "Discover the vision behind My Divine Stays, where soulful journeys, pilgrim stays, and sacred travel experiences connect you to deeper meaning.",
    alternates: {
        canonical: "https://mydivinestays.com/about-us",
      },
};



export default function GetInTouch() {

  const contacts = [
  {
    title: '24/7 Phone Support',
    description: 'Instant assistance anytime',
    icon: PhoneIcon,
  },
  {
    title: 'Live Chat',
    description: 'Quick responses guaranteed',
    icon: ChatBubbleLeftEllipsisIcon,
  },
  {
    title: 'Email Support',
    description: 'Detailed assistance via email',
    icon: EnvelopeIcon,
  },
]

function GetInTouch() {
  return (
    <section className="py-16 mt-20 bg-[#1035ac]">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-league-spartan font-bold text-white">
          Get in Touch
        </h2>
        <p className="mt-2 text-lg font-alice text-gray-200">
          We’re here to make your spiritual journey seamless. Reach out to us anytime!
        </p>

        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-8">
          {contacts.map((item) => (
            <div
              key={item.title}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex-1 max-w-xs mx-auto hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 mx-auto rounded-lg bg-white/20 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-white font-league-spartan font-semibold">
                {item.title}
              </h3>
              <p className="mt-1 text-gray-200 font-alice text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

  return (
    <>
     {/* {GetInTouch()} */}
    <div className="min-h-screen  py-28 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-7xl mx-auto space-y-24">
        {/* About Us Section */}
        <section className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              {/* <span className="text-3xl">👋</span> */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">About Us</h2>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              My Divine Stay (MDS) is an online booking and management platform created exclusively for Dharamshalas. It allows pilgrims and devotees to search, select, and book Dharamshala rooms easily from anywhere. With real-time availability, secure online payments, and complete transparency, MDS simplifies the entire accommodation process for both guests and Dharamshala management. It combines modern technology with the traditional purpose of Dharamshalas, making spiritual stays more organized, accessible, and efficient.

            </p>
          </div>

          {/* <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="col-span-1 aspect-square">
              <Image
                src="/placeholder.svg?height=120&width=120"
                alt="Food and dining"
                width={120}
                height={120}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div className="col-span-1 aspect-square">
              <Image
                src="/placeholder.svg?height=120&width=120"
                alt="Nature landscape"
                width={120}
                height={120}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div className="col-span-1 aspect-square">
              <Image
                src="/placeholder.svg?height=120&width=120"
                alt="Colorful parrot"
                width={120}
                height={120}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div className="col-span-1 aspect-square">
              <Image
                src="/placeholder.svg?height=120&width=120"
                alt="Palm tree silhouette"
                width={120}
                height={120}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div className="col-span-1 aspect-square">
              <Image
                src="/placeholder.svg?height=120&width=120"
                alt="Mountain landscape"
                width={120}
                height={120}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div> */}
        </section>

        {/* Founder Section */}
        {/* <section className="space-y-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🚀</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">Founder</h2>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              We're impartial and independent, and every day we create distinctive, world-class programmes and content
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="aspect-square">
              <Image
                src="/placeholder.svg?height=280&width=280"
                alt="Founder portrait 1"
                width={280}
                height={280}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div className="aspect-square">
              <Image
                src="/placeholder.svg?height=280&width=280"
                alt="Founder portrait 2"
                width={280}
                height={280}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div className="aspect-square">
              <Image
                src="/placeholder.svg?height=280&width=280"
                alt="Founder portrait 3"
                width={280}
                height={280}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div className="aspect-square">
              <Image
                src="/placeholder.svg?height=280&width=280"
                alt="Founder portrait 4"
                width={280}
                height={280}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </section> */}

        {/* Fast Facts Section */}
        {/* <section className="space-y-12">
          <div className="max-w-5xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🚀</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">Fast facts about Religious Tourism in India</h2>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              Religious tourism in India attracts millions of pilgrims each year, offering spiritual journeys to iconic temples, shrines, and sacred sites, enriching both cultural heritage and faith-based experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10 lg:gap-15">
            <div className="space-y-4 bg-gray-50 p-5 rounded-2xl">
              <h3 className="text-3xl font-bold text-gray-900">150-200 Millions</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Total Pilgrims per Year (India)
              </p>
            </div>

            <div className="space-y-4 bg-gray-50 p-5 rounded-2xl">
              <h3 className="text-3xl font-bold text-gray-900">40-50%</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Staying in Dharamshalas</p>
            </div>

            <div className="space-y-4 bg-gray-50 p-5 rounded-2xl">
              <h3 className="text-3xl font-bold text-gray-900">60-100 Millions per year</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Estimated Pilgrims using Dharamshalas
              </p>
            </div>
          </div>
        </section> */}
      </div>
     
    </div>
    </>
  )
}

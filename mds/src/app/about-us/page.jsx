import Image from "next/image"

export default function AboutSection() {
  return (
    <div className="min-h-screen  py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-24">
        {/* About Us Section */}
        <section className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👋</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">About Us.</h2>
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
        <section className="space-y-12">
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
        </section>
      </div>
    </div>
  )
}

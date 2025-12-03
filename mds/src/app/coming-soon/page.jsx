import Image from "next/image"
import { Star, Share, Heart, Users, Bed, Bath, Home, Calendar, User } from "lucide-react"
import comingSoon from '../../../public/comming-soon.jpeg'
export default function ComingSoonRental() {
  return (
    <div className="max-w-7xl mx-auto p-4 mt-20 lg:p-6">
      {/* Image Gallery Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 mb-6 relative">
        {/* Main Image */}
        <div className="lg:col-span-3 lg:row-span-2 relative">
          <div className="aspect-4/3 lg:aspect-3/2 rounded-l-xl lg:rounded-l-2xl overflow-hidden relative group">
            <Image
              src={comingSoon.src}
              alt="coming soon"
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0  flex items-center justify-center">
              {/* <div className="text-center text-white">
                <h3 className="text-2xl lg:text-3xl font-bold mb-2">Coming Soon</h3>
                <p className="text-sm lg:text-base opacity-90">This amazing property will be available soon</p>
              </div> */}
            </div>
          </div>
        </div>

        {/* Secondary Images */}
        <div className="hidden lg:block relative">
          <div className="aspect-square rounded-tr-2xl overflow-hidden relative group">
            <Image
              src={comingSoon.src}
              alt="Interior View 1"
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 "></div>
          </div>
        </div>

        <div className="hidden lg:block relative">
          <div className="aspect-square overflow-hidden relative group">
            <Image
              src={comingSoon.src}
              alt="Interior View 2"
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 "></div>
          </div>
        </div>

        {/* <div className="hidden lg:block relative">
          <div className="aspect-square overflow-hidden relative group">
            <Image
              src="/placeholder.svg?height=300&width=300"
              alt="Interior View 3"
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        </div> */}

        {/* <div className="hidden lg:block relative">
          <div className="aspect-square rounded-br-2xl overflow-hidden relative group">
            <Image
              src="/placeholder.svg?height=300&width=300"
              alt="Interior View 4"
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        </div> */}

        {/* Show all photos button */}
        <button className="absolute bottom-4 left-4 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
            <div className="bg-gray-600 rounded-sm"></div>
            <div className="bg-gray-600 rounded-sm"></div>
            <div className="bg-gray-600 rounded-sm"></div>
            <div className="bg-gray-600 rounded-sm"></div>
          </div>
          Show all photos
        </button>
      </div>

      {/* Property Details Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Property Info */}
        <div className="xl:col-span-2 space-y-6">
          {/* Property Type Badge */}
          <div className="inline-block">
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">Wooden house</span>
          </div>

          {/* Title and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Coming soon</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current text-yellow-400" />
                  <span className="font-medium">4.5</span>
                  <span>(112)</span>
                </div>
                <span>•</span>
                <span>coming soon</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 underline text-sm font-medium">
                <Share className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 underline text-sm font-medium">
                <Heart className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>

          {/* Host Info */}
          <div className="flex items-center gap-3 py-4 border-b border-gray-200">
            <div className="relative">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                Hosted by <span className="font-medium text-gray-900">Coming soon</span>
              </p>
            </div>
          </div>

          {/* Property Features */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-5 h-5" />
              <span className="text-sm">6 guests</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Bed className="w-5 h-5" />
              <span className="text-sm">6 beds</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Bath className="w-5 h-5" />
              <span className="text-sm">3 baths</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Home className="w-5 h-5" />
              <span className="text-sm">2 bedrooms</span>
            </div>
          </div>
        </div>

        {/* Right Column - Booking Card */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg sticky top-6">
            {/* Price */}
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-2xl font-bold text-gray-900">₹ 2,500</span>
              <span className="text-gray-600">/night</span>
              <div className="ml-auto flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-current text-yellow-400" />
                <span className="font-medium">4.5</span>
                <span className="text-gray-600">(112)</span>
              </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="text-center">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900 mb-1">Coming Soon</h3>
                <p className="text-sm text-gray-600">
                  This property will be available for booking soon. Check back later!
                </p>
              </div>
            </div>

            {/* Booking Details (Disabled State) */}
            <div className="space-y-4 opacity-50">
              <div className="grid grid-cols-2 gap-2">
                <div className="border border-gray-200 rounded-lg p-3">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Check In</label>
                  <div className="text-sm text-gray-900">Feb 06</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Check Out</label>
                  <div className="text-sm text-gray-900">Feb 23</div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Guests</label>
                <div className="text-sm text-gray-900">4 Guests</div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span>$119 x 3 night</span>
                  <span>$357</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service charge</span>
                  <span>$0</span>
                </div>
                <div className="flex justify-between font-medium text-base pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>$199</span>
                </div>
              </div>
            </div>

            {/* Notify Me Button */}
            <button className="w-full bg-[#4f46e5] cursor-pointer text-white font-medium py-3 px-4 rounded-lg mt-4 transition-colors">
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

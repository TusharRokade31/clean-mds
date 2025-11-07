import { Button } from "@mui/material"
import { Star, Wifi, Car, Utensils, Shield, Droplets, MapPin, Heart } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function PropertyCard({
  id,
  name,
  location,
  rating,
  reviews,
  price,
  verified,
  distance,
  amenities,
  tags,
  images = [],
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="w-4 h-4" />
      case "parking":
        return <Car className="w-4 h-4" />
      case "meals":
        return <Utensils className="w-4 h-4" />
      case "security":
        return <Shield className="w-4 h-4" />
      case "hot water":
        return <Droplets className="w-4 h-4" />
      default:
        return null
    }
  }

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index)
  }
  
  const currentImage = images[currentImageIndex]
  const imageUrl = currentImage ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${currentImage.url}` : null
  
  const thumbnailImages = images.slice(0, 4)
  const hasMoreImages = images.length > 4

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group">
      <div className="flex flex-col">
        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Image Section */}
          <div className="relative w-full">
            {/* Verified Badge */}
            {verified && (
              <div className="absolute top-3 left-3 bg-linear-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 z-2 shadow-lg">
                <span className="text-sm">✓</span> Verified
              </div>
            )}
            
            {/* Wishlist Heart */}
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full z-10 shadow-lg hover:scale-110 transition-transform"
            >
              <Heart 
                className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            </button>
            
            {/* Main Image */}
            <div className="h-56 relative overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={currentImage.filename || name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-100 to-purple-100">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-linear-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <span className="text-3xl">🏨</span>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Hotel Image</div>
                  </div>
                </div>
              )}
              {/* Image Counter */}
              {images.length > 0 && (
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-5">
            <h3 className="text-xl font-bold mb-1 text-gray-900 group-hover:text-blue-600 transition-colors">{name}</h3>
            <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
              <MapPin className="w-4 h-4 text-red-500" />
              <p>{location}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center bg-linear-to-r from-yellow-400 to-orange-400 px-3 py-1.5 rounded-lg shadow-md">
                <Star className="w-4 h-4 text-white fill-white mr-1" />
                <span className="font-bold text-white text-sm">{rating}</span>
              </div>
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">{reviews}</span> reviews
              </span>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2 mb-5">
              {amenities.slice(0, 4).map((amenity) => (
                <div key={amenity} className="bg-linear-to-r from-blue-50 to-purple-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 flex items-center gap-1">
                  {getAmenityIcon(amenity)}
                  <span>{amenity}</span>
                </div>
              ))}
            </div>

            {/* Price and Button */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <div>
                <div className="text-sm text-gray-400 line-through">₹{Math.round(price * 1.2).toLocaleString()}</div>
                <div className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ₹{price.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">per night + taxes</div>
              </div>
              <Link href={`/hotel-details/${id}`}>
                <Button 
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #1035ac 0%, #7c3aed 100%)',
                    color: 'white',
                    textTransform: 'none',
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(16, 53, 172, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0d2d8f 0%, #6d28d9 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(16, 53, 172, 0.4)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex">
          {/* Image Section */}
          <div className="relative w-80 bg-gray-200">
            {verified && (
              <div className="absolute top-3 left-3 bg-linear-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 z-10 shadow-lg">
                <span className="text-sm">✓</span> Verified
              </div>
            )}
            
            {/* Wishlist Heart */}
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full z-10 shadow-lg hover:scale-110 transition-transform"
            >
              <Heart 
                className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            </button>
            
            {distance && (
              <div className="absolute top-3 right-14 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold z-10 shadow-md">
                {distance}
              </div>
            )}
            
            {/* Main Image */}
            <div className="h-52 relative overflow-hidden rounded-tl-2xl">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={currentImage.filename || name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-r from-blue-100 to-purple-100">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-linear-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <span className="text-3xl">🏨</span>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">Hotel Image</div>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {thumbnailImages.length > 0 && (
              <div className="flex gap-1.5 p-3 bg-linear-to-r from-gray-50 to-blue-50 rounded-bl-2xl">
                {thumbnailImages.map((image, index) => {
                  const thumbUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}${image.url}`
                  const isLast = index === 3 && hasMoreImages
                  
                  return (
                    <div
                      key={index}
                      className={`w-16 h-16 relative cursor-pointer overflow-hidden rounded-lg ${
                        index === currentImageIndex ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                      } hover:scale-105 transition-all duration-300 shadow-md`}
                      onClick={() => handleThumbnailClick(index)}
                    >
                      <img
                        src={thumbUrl}
                        alt={image.filename || `${name} ${index + 1}`}
                        className="w-full h-full object-cover hover:brightness-110 transition-all"
                      />
                      
                      {isLast && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                          <div className="text-white text-xs font-bold text-center">
                            <div className="text-base">+{images.length - 4}</div>
                            <div className="text-[10px]">more</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Desktop Content */}
          <div className="flex-1 p-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 h-full">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-1 text-gray-900 group-hover:text-blue-600 transition-colors">{name}</h3>
                <div className="flex items-center gap-1 text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <p className="font-medium">{location}</p>
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center bg-linear-to-r from-yellow-400 to-orange-400 px-3 py-1.5 rounded-lg shadow-md">
                    <Star className="w-4 h-4 text-white fill-white mr-1" />
                    <span className="font-bold text-white">{rating}</span>
                  </div>
                  <span className="text-gray-600">
                    <span className="font-semibold text-gray-800">{reviews}</span> reviews
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {amenities.slice(0, 6).map((amenity) => (
                    <div key={amenity} className="bg-linear-to-r from-blue-50 to-purple-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 flex items-center gap-1">
                      {getAmenityIcon(amenity)}
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right lg:ml-6 flex flex-col justify-between h-full">
                <div>
                  <div className="text-sm text-gray-400 line-through mb-1">₹{Math.round(price * 1.2).toLocaleString()}</div>
                  <div className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                    ₹{price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">per night</div>
                  <div className="text-xs text-gray-400 mb-5">+ ₹{Math.round(price * 0.18)} taxes</div>
                </div>
                
                <Link href={`/hotel-details/${id}`}>
                  <Button sx={{
                    background: 'linear-gradient(135deg, #1035ac 0%, #7c3aed 100%)',
                    color: 'white',
                    textTransform: 'none',
                    borderRadius: '12px',
                    px: 4,
                    py: 1.5,
                    fontSize: '15px',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(16, 53, 172, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0d2d8f 0%, #6d28d9 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(16, 53, 172, 0.4)',
                    },
                    transition: 'all 0.3s ease',
                    width: '100%'
                  }} >
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import { Button } from "@mui/material"
import { Star, Wifi, Car, Utensils, Shield, Droplets, Badge, Heart } from "lucide-react"
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
  
  // Show up to 4 images for thumbnails
  const thumbnailImages = images.slice(0, 4)
  const hasMoreImages = images.length > 4

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col">
        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Image Section */}
          <div className="relative w-full">
            {/* Best Value Badge */}
             {verified && (
              <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1 z-5">
                ✓ Verified
              </div>
            )}
            
            {/* Wishlist Heart */}
           
            
            {/* Main Image */}
            <div className="h-48 relative overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={currentImage.filename || name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-6xl">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      🏠
                    </div>
                    <div className="text-sm text-gray-500">Hotel Image</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-1">{name}</h3>
            <p className="text-gray-600 text-sm mb-2">{location}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="font-medium text-sm">{rating} ({reviews} reviews)</span>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2 mb-4">
              {amenities.slice(0, 4).map((amenity) => (
                <div key={amenity} className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {amenity}
                </div>
              ))}
            </div>

            {/* Price and Button */}
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-400 line-through">₹{Math.round(price * 1.2).toLocaleString()}</div>
                <div className="text-xl font-bold text-blue-600">₹{price.toLocaleString()}</div>
                <div className="text-xs text-gray-500">per night</div>
              </div>
              <Link href={`/hotel-details/${id}`}>
                <Button 
                  variant="contained"
                  sx={{
                    backgroundColor: '#1035ac',
                    color: 'white',
                    textTransform: 'none',
                    borderRadius: '8px',
                    px: 3,
                    py: 1,
                    '&:hover': {
                      backgroundColor: '#0d2d8f'
                    }
                  }}
                >
                  View Deal
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex">
          {/* Image Section */}
          <div className="relative flex-1 w-full lg:w-64 bg-gray-200">
            {verified && (
              <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1 z-5">
                ✓ Verified
              </div>
            )}
            <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded text-xs font-medium z-10">
              {distance}
            </div>
            
            {/* Main Image */}
            <div className="h-48 lg:h-40 relative overflow-hidden rounded-t-lg">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={currentImage.filename || name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl opacity-50">
                  🏛️
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {thumbnailImages.length > 0 && (
              <div className="flex gap-1 p-2 bg-gray-50 rounded-b-lg">
                {thumbnailImages.map((image, index) => {
                  const thumbUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}${image.url}`
                  const isLast = index === 3 && hasMoreImages
                  
                  return (
                    <div
                      key={index}
                      className={`w-16 h-16 relative cursor-pointer overflow-hidden rounded-md ${
                        index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleThumbnailClick(index)}
                    >
                      <img
                        src={thumbUrl}
                        alt={image.filename || `${name} ${index + 1}`}
                        className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                      />
                      
                      {isLast && (
                        <div className="absolute inset-0 backdrop-blur-sm bg-opacity-60 flex items-center justify-center">
                          <div className="text-white text-xs font-medium text-center">
                            <div className="text-sm font-bold">View All</div>
                            <div className="text-xs">{images.length} photos</div>
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
          <div className="flex-2 p-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">{name}</h3>
                <p className="text-gray-600 mb-3">{location}</p>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">({rating})</span>
                  <span className="text-gray-500">• {reviews} reviews</span>
                </div>

               <div className="flex flex-wrap gap-2 mb-4">
              {amenities.slice(0, 4).map((amenity) => (
                <div key={amenity} className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {amenity}
                </div>
              ))}
            </div>
              </div>

              <div className="text-right lg:ml-6">
                <div className="text-2xl font-bold text-blue-600 mb-1">₹{price.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mb-1">per night</div>
                <div className="text-xs text-gray-400 mb-4">+ ₹96 taxes</div>
                <Link href={`/hotel-details/${id}`}>
                  <Button sx={{
                    backgroundColor: '#1035ac',
                    color: 'white',
                    textTransform: 'none',
                    borderRadius: '8px',
                    px: 3,
                    py: 1,
                    '&:hover': {
                      backgroundColor: '#0d2d8f'
                    }
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
"use client"
import { Button, Card, Badge, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material"
import { Users, Bed, Bath, Square, Wifi, Tv, Wind, X, ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import BookingConfirmationDialog from "./BookingConfirmationDialog"

// Image Carousel Component (unchanged)
const ImageCarousel = ({ images, size = "small", room, handleRoomClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (!images || images.length === 0) {
    return (
      <div className={`${size === "large" ? "aspect-video h-96" : "aspect-square"} bg-gray-200 flex items-center justify-center`}>
        <span className="text-gray-500">No Image Available</span>
      </div>
    )
  }

  return (
    <div className={`relative w-full  ${size === "large" ? "aspect-video h-96" : "aspect-square"} overflow-hidden rounded-lg`}>
      <img
        onClick={() => handleRoomClick(room)}
        src={`${images[currentIndex].url}`}
        alt={`Room image ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />
      
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? "bg-white" : "bg-white bg-opacity-50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}



// Room Detail Modal Component (unchanged except for handleBookRoom call)
const RoomDetailModal = ({ handleBookRoom, room, open, onClose }) => {
  const getAmenityIcon = (amenityName) => {
    switch (amenityName.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-4 w-4" />
      case "tv":
        return <Tv className="h-4 w-4" />
      case "airconditioning":
        return <Wind className="h-4 w-4" />
      default:
        return null
    }
  }

  if (!room) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="flex justify-between items-center">
        <span className="text-2xl font-bold">{room.roomName}</span>
        <IconButton onClick={onClose}>
          <X className="h-5 w-5" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent className="space-y-6">
        {/* Large Image Carousel */}
        <ImageCarousel images={room.media?.images} size="large" />
        
        <div className="grid grid-cols-2 gap-6">
          {/* Room Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Room Details</h3>
              <p className="text-gray-600 mb-4">{room.description}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Square className="h-5 w-5 text-gray-500" />
                <span>{room.roomSize} {room.sizeUnit}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-500" />
                <span>Max {room.occupancy.maximumAdults} Adults, {room.occupancy.maximumChildren} Children</span>
              </div>

              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-gray-500" />
                <span>{room.beds.map((bed) => `${bed.count} ${bed.bedType}`).join(", ")}</span>
              </div>

              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-gray-500" />
                <span>{room.bathrooms?.count} {room.bathrooms?.private ? "Private" : "Shared"} Bathroom</span>
              </div>
            </div>

            {/* All Amenities */}
            <div>
              <h4 className="font-semibold mb-3">All Amenities</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(room.amenities.mandatory)
                  .filter(([_, amenity]) => amenity.available)
                  .map(([name]) => (
                    <div key={name} className="flex items-center gap-2">
                      {getAmenityIcon(name)}
                      <span className="text-sm">{name.replace(/([A-Z])/g, " $1").trim()}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="text-center mb-4">
              <p className="text-3xl font-bold">₹{room.pricing.baseAdultsCharge}</p>
              <p className="text-sm text-gray-500">per night</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Extra Adult:</span>
                <span className="font-semibold">₹{room.pricing.extraAdultsCharge}</span>
              </div>
              <div className="flex justify-between">
                <span>Child:</span>
                <span className="font-semibold">₹{room.pricing.childCharge}</span>
              </div>
              <div className="flex justify-between">
                <span>Available Rooms:</span>
                <span className="font-semibold">{room.numberRoom}</span>
              </div>
            </div>

            {room.mealPlan.available && (
              <div className="mb-4">
                <Badge variant="outline" className="w-full justify-center">
                  {room.mealPlan.planType || "Meal Plan Available"}
                </Badge>
              </div>
            )}

            <Button 
              className="w-full" 
              size="lg"
              onClick={() => handleBookRoom(room)}
            >
              Book This Room
            </Button>

            <p className="text-xs text-gray-500 text-center mt-2">Non-Refundable</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function RoomsSection({data, rooms }) {
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [bookingConfirmOpen, setBookingConfirmOpen] = useState(false)
  const [roomToBook, setRoomToBook] = useState(null)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const router = useRouter()

  const handleBookRoom = (room) => {
    setRoomToBook(room)
    setBookingConfirmOpen(true)
    // Close room detail modal if open
    if (modalOpen) {
      setModalOpen(false)
      setSelectedRoom(null)
    }
  }


  const getAmenityIcon = (amenityName) => {
    switch (amenityName.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-4 w-4" />
      case "tv":
        return <Tv className="h-4 w-4" />
      case "airconditioning":
        return <Wind className="h-4 w-4" />
      default:
        return null
    }
  }

  const handleRoomClick = (room) => {
    setSelectedRoom(room)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedRoom(null)
  }

  const handleBookingConfirmClose = () => {
    setBookingConfirmOpen(false)
    setRoomToBook(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Available Rooms</h2>
        <Badge variant="outline">
          {rooms?.length} Room{rooms?.length > 1 ? "s" : ""} Available
        </Badge>
      </div>

      <div className="grid gap-6">
        {rooms?.map((room, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Room Image Carousel */}
              <div className="md:col-span-1">
                <ImageCarousel images={room.media?.images} room={room} handleRoomClick={handleRoomClick} />
              </div>

              {/* Room Details */}
              <div className="md:col-span-1 p-6">
                <h3 className="text-xl font-semibold mb-2">{room.roomName}</h3>
                <p className="text-gray-600 mb-4">{room.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Square className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {room.roomSize} {room.sizeUnit}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      Max {room.occupancy.maximumAdults} Adults, {room.occupancy.maximumChildren} Children
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{room.beds.map((bed) => `${bed.count} ${bed.bedType}`).join(", ")}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {room.bathrooms?.count} {room.bathrooms?.private ? "Private" : "Shared"} Bathroom
                    </span>
                  </div>
                </div>

                {/* Room Amenities */}
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Room Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(room.amenities.mandatory)
                      .filter(([_, amenity]) => amenity.available)
                      .slice(0, 6)
                      .map(([name]) => (
                        <Badge key={name} variant="secondary" className="text-xs">
                          <span className="flex items-center gap-1">
                            {getAmenityIcon(name)}
                            {name.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>

              {/* Pricing & Booking */}
              <div className="md:col-span-1 p-6 bg-gray-50">
                <div className="text-center mb-4">
                  <p className="text-2xl font-bold">₹{room.pricing.baseAdultsCharge}</p>
                  <p className="text-sm text-gray-500">per night</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Extra Adult:</span>
                    <span>₹{room.pricing.extraAdultsCharge}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Child:</span>
                    <span>₹{room.pricing.childCharge}</span>
                  </div>
                </div>

                {room.mealPlan.available && (
                  <div className="mb-4">
                    <Badge variant="outline" className="w-full justify-center">
                      {room.mealPlan.planType || "Meal Plan Available"}
                    </Badge>
                  </div>
                )}

                <Button className="w-full" size="lg" onClick={() => handleBookRoom(room)}>
                  Book This Room
                </Button>

                <p className="text-xs text-gray-500 text-center mt-2">Non-Refundable</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Room Detail Modal */}
      <RoomDetailModal 
        handleBookRoom={handleBookRoom}
        room={selectedRoom} 
        open={modalOpen} 
        onClose={handleModalClose}
      />

      {/* Booking Confirmation Dialog */}
      <BookingConfirmationDialog
        room={roomToBook}
        property={data}
        open={bookingConfirmOpen}
        onClose={handleBookingConfirmClose}
        isLoading={isCheckingAvailability}
      />
    </div>
  )
}
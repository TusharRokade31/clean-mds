// components/BookingPage.jsx
"use client"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { createBooking } from "@/redux/features/bookings/bookingSlice"
import toast from "react-hot-toast"
// import { createBooking } from "../redux/features/bookings/bookingSlice"

export default function BookingPage({ property, selectedRoom }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const { isCreating, error } = useSelector((state) => state.booking)
  
  // Get booking details from localStorage
  const [bookingDetails, setBookingDetails] = useState(null)
  const [guestDetails, setGuestDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    idType: "aadhar",
    idNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India"
    },
    age: "20",
    gender: "male"
  })
  const [specialRequests, setSpecialRequests] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("upi")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [pricingDetails, setPricingDetails] = useState(null)

  useEffect(() => {
    // Get search details from localStorage
    const lastSearchQuery = JSON.parse(localStorage.getItem('lastSearchQuery') || '{}')
    console.log(lastSearchQuery)
    if (lastSearchQuery && selectedRoom) {
      const checkinDate = new Date(lastSearchQuery.checkin)
      const checkoutDate = new Date(lastSearchQuery.checkout)
      const totalDays = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24))
      const persons = parseInt(lastSearchQuery.persons) || 2
      
      // Calculate adults and children (assuming all are adults for now)
      const adults = Math.min(persons, selectedRoom.occupancy.maximumAdults)
      const children = Math.max(0, persons - adults)

      const pricing = calculatePricing(selectedRoom, adults, children, totalDays)
      
      setBookingDetails({
        checkin: lastSearchQuery.checkin,
        checkout: lastSearchQuery.checkout,
        adults,
        children,
        totalDays,
        location: lastSearchQuery.location
      })
      
      setPricingDetails(pricing)

      
  // console.log(pricing, "Princing ")
  // console.log(pricingDetails, "pricingDetails ")
console.log(calculatePricing(selectedRoom, adults, children, totalDays) ,"calculated price")
      
    }
  }, [selectedRoom])


  const calculatePricing = (room, adults, children, totalDays) => {
    const baseAdults = room.occupancy.baseAdults
    const baseCharge = room.pricing.baseAdultsCharge
    const extraAdults = Math.max(0, adults - baseAdults)
    const extraAdultCharge = extraAdults * room.pricing.extraAdultsCharge
    const childCharge = children * room.pricing.childCharge
    
    const dailyRate = baseCharge + extraAdultCharge + childCharge
    const subtotal = dailyRate * totalDays
    const serviceCharges = 50 // Fixed service charge
    const taxes = (subtotal + serviceCharges) * 0.12 // 12% GST
    const totalAmount = subtotal + serviceCharges + taxes

    return {
      baseCharge: baseCharge * totalDays,
      extraAdultCharge: extraAdultCharge * totalDays,
      childCharge: childCharge * totalDays,
      subtotal,
      serviceCharges,
      taxes,
      totalAmount,
      totalDays
    }
  }

  

  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setGuestDetails(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value
        }
      }))
    } else {
      setGuestDetails(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!agreeTerms) {
      toast.error("Please agree to the terms and conditions")
      return
    }

    const bookingData = {
      propertyId: property._id,
      roomId: selectedRoom._id,
      primaryGuest: guestDetails,
      checkIn: bookingDetails.checkin,
      checkOut: bookingDetails.checkout,
      guestCount: {
        adults: bookingDetails.adults,
        children: bookingDetails.children
      },
      paymentMethod,
      specialRequests,
      source: 'online'
    }

    try {
      const result = await dispatch(createBooking(bookingData)).unwrap()
      // Store booking details for payment processing
      localStorage.setItem('currentBooking', JSON.stringify(result))
      router.push(`/booking-confirmation/${result.bookingId}`)
    } catch (error) {
      console.error('Booking failed:', error)
    }
  }

  if (!bookingDetails || !pricingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {property.placeName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{property.placeName}</h3>
                  <p className="text-gray-600">{property.location.city}, {property.location.state}</p>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Room Type:</span>
                      <p className="font-medium">{selectedRoom.roomName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Guests:</span>
                      <p className="font-medium">{bookingDetails.adults + bookingDetails.children} Adults</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Check-in:</span>
                      <p className="font-medium">{new Date(bookingDetails.checkin).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Check-out:</span>
                      <p className="font-medium">{new Date(bookingDetails.checkout).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-blue-600">₹{selectedRoom.pricing.baseAdultsCharge}</span>
                    <span className="text-gray-500 ml-1">per night</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Details Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Guest Details</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={`${guestDetails.firstName} ${guestDetails.lastName}`}
                      onChange={(e) => {
                        const names = e.target.value.split(' ')
                        setGuestDetails(prev => ({
                          ...prev,
                          firstName: names[0] || '',
                          lastName: names.slice(1).join(' ') || names[0]
                        }))
                      }}
                      placeholder="Rajesh Kumar Sharma"
                    />
                  </div> */}
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={guestDetails.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Rajesh"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={guestDetails.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Sharma"
                  />
                </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={guestDetails.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={guestDetails.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="rajesh.sharma@example.com"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Proof Type *
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={guestDetails.idType}
                      onChange={(e) => handleInputChange('idType', e.target.value)}
                    >
                      <option value="aadhar">Aadhar Card</option>
                      <option value="passport">Passport</option>
                      <option value="driving_license">Driving License</option>
                      <option value="voter_id">Voter ID</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Number *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={guestDetails.idNumber}
                      onChange={(e) => handleInputChange('idNumber', e.target.value)}
                      placeholder="1234 5678 9012"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any special requirements or requests..."
                  />
                </div>
              </form>
            </div>

            {/* Important Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Valid ID proof is mandatory for check-in</li>
                      <li>Check-in time: 12:00 PM | Check-out time: 11:00 AM</li>
                      <li>Cancellation allowed up to 24 hours before check-in</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Options</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <div className="ml-3 flex items-center">
                    <div className="w-10 h-10 bg-purple-600 rounded flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">UPI Payment</p>
                      <p className="text-sm text-gray-500">Pay using Google Pay, PhonePe, Paytm, or any UPI app</p>
                    </div>
                    <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Instant</span>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <div className="ml-3 flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">Net Banking</p>
                      <p className="text-sm text-gray-500">Pay directly from your bank account</p>
                    </div>
                    <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Secure</span>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <div className="ml-3 flex items-center">
                    <div className="w-10 h-10 bg-yellow-600 rounded flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">Credit/Debit Cards</p>
                      <p className="text-sm text-gray-500">Visa, Mastercard, RuPay, American Express</p>
                    </div>
                    <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Popular</span>
                  </div>
                </label>
              </div>

              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to the{" "}
                    <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a>,{" "}
                    <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>, and{" "}
                    <a href="#" className="text-blue-600 hover:underline">Cancellation Policy</a>.
                    I understand that my booking is subject to availability and confirmation.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Price Breakdown Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Price Details */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Price Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>₹{selectedRoom.pricing.baseAdultsCharge} × {bookingDetails.totalDays} nights</span>
                    <span>₹{pricingDetails.baseCharge}</span>
                  </div>
                  {pricingDetails.extraAdultCharge > 0 && (
                    <div className="flex justify-between">
                      <span>Extra adults</span>
                      <span>₹{pricingDetails.extraAdultCharge}</span>
                    </div>
                  )}
                  {pricingDetails.childCharge > 0 && (
                    <div className="flex justify-between">
                      <span>Children</span>
                      <span>₹{pricingDetails.childCharge}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Service charges</span>
                    <span>₹{pricingDetails.serviceCharges}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (12%)</span>
                    <span>₹{Math.round(pricingDetails.taxes)}</span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span className="text-blue-600">₹{Math.round(pricingDetails.totalAmount)}</span>
                  </div>
                  <p className="text-xs text-gray-500">Inclusive of all taxes</p>
                </div>

                <div className="mt-4">
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700">
                      Apply
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isCreating || !agreeTerms}
                  className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isCreating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Proceed to Payment
                    </>
                  )}
                </button>

                <div className="mt-3 flex items-center justify-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secured by Razorpay
                </div>
              </div>

              {/* Why Book With Us */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Why Book With Us?</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Instant confirmation</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">24x7 customer support</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Secure payment gateway</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Free cancellation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
    </div>
  )
}
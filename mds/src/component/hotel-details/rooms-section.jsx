"use client"
import { useState, useMemo, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { useSelector } from "react-redux"
import {
  Users, Bed, Bath, Square, Wifi, Tv, Wind,
  X, ChevronLeft, ChevronRight, Plus, Minus,
  ShoppingCart, Check, Info, Layers, Coffee,
  Shield, Utensils, AlertCircle, Copy
} from "lucide-react"
import BookingConfirmationDialog from "./BookingConfirmationDialog"

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BLUE = "#1035ac"

const amenityIcon = (name) => {
  const n = name.toLowerCase()
  if (n.includes("wifi"))                      return <Wifi     className="h-3 w-3" />
  if (n.includes("tv"))                        return <Tv       className="h-3 w-3" />
  if (n.includes("air") || n.includes("ac"))   return <Wind     className="h-3 w-3" />
  if (n.includes("coffee")||n.includes("tea")) return <Coffee   className="h-3 w-3" />
  if (n.includes("safe")||n.includes("lock"))  return <Shield   className="h-3 w-3" />
  if (n.includes("meal")||n.includes("food"))  return <Utensils className="h-3 w-3" />
  return null
}

/** Live nightly rate given guest counts */
const nightlyRate = (room, adults, children) => {
  const base  = room.pricing?.baseAdultsCharge  || 0
  const eRate = room.pricing?.extraAdultsCharge || 0
  const cRate = room.pricing?.childCharge       || 0
  const extra = Math.max(0, adults - (room.occupancy?.baseAdults || 1))
  return base + extra * eRate + children * cRate
}

const CART_KEY = "roomsCart_v2"
const loadCart = () => { try { return JSON.parse(sessionStorage.getItem(CART_KEY) || "[]") } catch { return [] } }
const saveCart = (c) => { try { sessionStorage.setItem(CART_KEY, JSON.stringify(c)) } catch {} }

// ─── Image Carousel ───────────────────────────────────────────────────────────
function ImageCarousel({ images, size = "small", onClick }) {
  const [idx, setIdx] = useState(0)
  if (!images?.length) return (
    <div className={`${size === "large" ? "h-56" : "h-44"} bg-gray-100 flex items-center justify-center rounded-lg`}>
      <Square className="h-8 w-8 text-gray-300" />
    </div>
  )
  return (
    <div className={`relative w-full ${size === "large" ? "h-56" : "h-44"} overflow-hidden rounded-lg`}>
      <img src={images[idx].url} alt="" className="w-full h-full object-cover cursor-pointer" onClick={onClick} />
      {images.length > 1 && (
        <>
          <button onClick={e=>{e.stopPropagation();setIdx(i=>(i-1+images.length)%images.length)}}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full">
            <ChevronLeft className="h-3 w-3" />
          </button>
          <button onClick={e=>{e.stopPropagation();setIdx(i=>(i+1)%images.length)}}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full">
            <ChevronRight className="h-3 w-3" />
          </button>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_,i)=><span key={i} className={`w-1.5 h-1.5 rounded-full ${i===idx?"bg-white":"bg-white/40"}`}/>)}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Amenity chips ────────────────────────────────────────────────────────────
function AmenityChips({ amenities, limit = 6 }) {
  const items = []
  if (!amenities) return null
  for (const cat of ["mandatory","popularWithGuests","basicFacilities","bathroom","roomFeatures"]) {
    if (!amenities[cat]) continue
    for (const [k,v] of Object.entries(amenities[cat])) if (v?.available) items.push(k)
  }
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {items.slice(0,limit).map(n=>(
        <span key={n} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
          {amenityIcon(n)}{n.replace(/([A-Z])/g," $1").trim()}
        </span>
      ))}
      {items.length>limit && <span className="text-xs text-gray-400 self-center">+{items.length-limit} more</span>}
    </div>
  )
}

// ─── Stepper ──────────────────────────────────────────────────────────────────
function Stepper({ label, value, min, max, onChange }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <div className="flex items-center gap-1.5">
        <button onClick={()=>onChange(Math.max(min,value-1))} disabled={value<=min}
          className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-30 hover:border-blue-500">
          <Minus className="h-2.5 w-2.5"/>
        </button>
        <span className="w-4 text-center font-bold text-gray-800">{value}</span>
        <button onClick={()=>onChange(Math.min(max,value+1))} disabled={value>=max}
          className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-30 hover:border-blue-500">
          <Plus className="h-2.5 w-2.5"/>
        </button>
      </div>
    </div>
  )
}

// ─── Room Detail Drawer ───────────────────────────────────────────────────────
function RoomDetailModal({ room, open, onClose, cartItems, onAddInstance, onRemoveInstance, onGuestChange }) {
  if (!room || !open) return null
  const instances = cartItems.filter(c=>c.roomId===room._id)
  const maxOcc = room.occupancy?.maximumOccupancy
  const cats = {"Mandatory":"mandatory","Popular":"popularWithGuests","Bathroom":"bathroom","Room Features":"roomFeatures","Kitchen":"kitchenAppliances","Safety":"safetyAndSecurity"}
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}/>
      <div className="relative ml-auto w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 bg-white border-b px-5 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{room.roomName}</h2>
            <p className="text-xs text-gray-400">Room #{room.numberRoom}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="h-4 w-4"/></button>
        </div>

        <div className="p-5 space-y-5">
          <ImageCarousel images={room.media?.images} size="large"/>

          <div className="grid grid-cols-4 gap-2">
            {[
              {l:"Size",    v:`${room.roomSize}${room.sizeUnit}`},
              {l:"Max Adults", v:room.occupancy?.maximumAdults},
              {l:"Max Kids",   v:room.occupancy?.maximumChildren},
              {l:"Bathroom",v:room.bathrooms?.private?"Private":"Shared"},
            ].map(({l,v})=>(
              <div key={l} className="flex flex-col items-center bg-blue-50 rounded-lg py-2">
                <span className="text-xs text-gray-400">{l}</span>
                <span className="text-sm font-semibold" style={{color:BLUE}}>{v}</span>
              </div>
            ))}
          </div>

          {room.description && <p className="text-sm text-gray-500 leading-relaxed">{room.description}</p>}

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><Bed className="h-4 w-4 text-blue-600"/>Beds</p>
            <div className="flex flex-wrap gap-1.5">
              {room.beds?.map((b,i)=>(
                <span key={i} className="text-xs bg-blue-50 border border-blue-200 text-blue-800 px-2.5 py-1 rounded-full">
                  {b.count}× {b.bedType} (fits {b.accommodates})
                </span>
              ))}
            </div>
          </div>

          {room.FloorBedding?.available && (
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-600 shrink-0"/>
              <span className="text-sm text-amber-800"><strong>Floor Bedding:</strong> {room.FloorBedding.count} mats · {room.FloorBedding.peoplePerFloorBedding} pax/mat</span>
            </div>
          )}

          {room.mealPlan?.available && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-100 flex items-center gap-2">
              <Utensils className="h-4 w-4 text-green-600"/>
              <span className="text-sm text-green-800 font-medium">{room.mealPlan.planType||"Meal Plan Included"}</span>
            </div>
          )}

          {Object.entries(cats).map(([label,key])=>{
            if(!room.amenities?.[key]) return null
            const avail=Object.entries(room.amenities[key]).filter(([_,v])=>v?.available)
            if(!avail.length) return null
            return (
              <div key={key}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {avail.map(([n])=>(
                    <span key={n} className="flex items-center gap-1 text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                      {amenityIcon(n)}{n.replace(/([A-Z])/g," $1").trim()}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Pricing */}
          <div className="rounded-xl p-4 text-white" style={{background:BLUE}}>
            <p className="font-semibold mb-2 text-sm">Pricing per night</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-blue-200">Base (up to {room.occupancy?.baseAdults} adults)</span><span className="font-bold text-yellow-300">₹{room.pricing?.baseAdultsCharge}</span></div>
              <div className="flex justify-between"><span className="text-blue-200">Extra adult</span><span>₹{room.pricing?.extraAdultsCharge}</span></div>
              <div className="flex justify-between"><span className="text-blue-200">Child</span><span>₹{room.pricing?.childCharge}</span></div>
              {room.pricing?.extraFloorBeddingCharge>0 && <div className="flex justify-between"><span className="text-blue-200">Floor mat</span><span>₹{room.pricing.extraFloorBeddingCharge}</span></div>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 space-y-2">
          {instances.map(inst=>(
            <div key={inst.cartKey} className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
              <Check className="h-3.5 w-3.5 text-blue-600 shrink-0"/>
              <span className="text-xs text-blue-800 font-medium flex-1">
                {inst.guestCount.adults}A{inst.guestCount.children>0?` ${inst.guestCount.children}C`:""} · ₹{nightlyRate(room,inst.guestCount.adults,inst.guestCount.children)}/night
              </span>
              <button onClick={()=>onRemoveInstance(inst.cartKey)} className="text-xs text-red-400 hover:text-red-600 border border-red-100 px-2 py-0.5 rounded">Remove</button>
            </div>
          ))}
          <button onClick={()=>onAddInstance(room)} className="w-full text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{background:BLUE}}>
            <Plus className="h-4 w-4"/> {instances.length>0?"Add Room":"Add Room"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Room Card ────────────────────────────────────────────────────────────────
function RoomCard({ room, instances, onAddInstance, onRemoveInstance, onGuestChange, onViewDetails }) {
  const has = instances.length > 0
  const maxOcc = room.occupancy?.maximumOccupancy

  return (
    <div className={`bg-white rounded-xl overflow-hidden border-2 transition-all duration-200 ${has?"shadow-md":"border-gray-200 hover:border-blue-200 hover:shadow-sm"}`}
      style={has?{borderColor:BLUE}:{} }>
      {has && (
        <div className="text-white text-xs font-semibold px-4 py-1.5 flex items-center gap-1.5" style={{background:BLUE}}>
          <Check className="h-3 w-3"/> {instances.length} selection{instances.length>1?"s":""} added to booking
        </div>
      )}

      <div className="grid md:grid-cols-[250px_1fr_210px]">
        {/* Image */}
        <div className="p-3"><ImageCarousel images={room.media?.images} onClick={()=>onViewDetails(room)}/></div>

        {/* Details */}
        <div className="p-4 pr-2">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="text-base font-bold text-gray-900">{room.roomName}</h3>
              <p className="text-xs text-gray-400">Room #{room.numberRoom}</p>
            </div>
            <button onClick={()=>onViewDetails(room)}
              className="shrink-0 text-xs border text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg flex items-center gap-1 mt-0.5 transition-colors"
              style={{borderColor:"#bfdbfe"}}>
              <Info className="h-3 w-3"/> Details
            </button>
          </div>

          {room.description && <p className="text-xs text-gray-400 mb-2 line-clamp-2">{room.description}</p>}

          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Square className="h-3 w-3 text-gray-300"/>{room.roomSize}{room.sizeUnit}</span>
            <span className="flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              <Users className="h-3 w-3"/>Capacity: {room.occupancy?.maximumOccupancy} guests
            </span>
            <span className="flex items-center gap-1"><Bed className="h-3 w-3 text-gray-300"/>{room.beds?.map(b=>`${b.count} ${b.bedType}`).join(", ")}</span>
            <span className="flex items-center gap-1"><Bath className="h-3 w-3 text-gray-300"/>{room.bathrooms?.count} {room.bathrooms?.private?"Private":"Shared"}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {room.FloorBedding?.available && (
              <span className="flex items-center gap-1 text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full">
                <Layers className="h-3 w-3"/> Floor Bedding: {room.FloorBedding.count} mats
              </span>
            )}
            {room.mealPlan?.available && (
              <span className="flex items-center gap-1 text-xs bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full">
                <Utensils className="h-3 w-3"/> {room.mealPlan.planType||"Meal Plan"}
              </span>
            )}
          </div>

          <AmenityChips amenities={room.amenities} limit={6}/>
        </div>

        {/* Pricing + CTA */}
        <div className="p-4 bg-gray-50 border-l border-gray-100 flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-400">Base rate / night</p>
            <p className="text-xl font-bold text-gray-900">₹{room.pricing?.baseAdultsCharge}</p>
            <div className="space-y-0.5 text-xs text-gray-400 mt-0.5">
              <div className="flex justify-between"><span>Extra adult</span><span>+₹{room.pricing?.extraAdultsCharge}</span></div>
              <div className="flex justify-between"><span>Child</span><span>+₹{room.pricing?.childCharge}</span></div>
            </div>
          </div>

          {/* Each cart instance controls */}
          {instances.map(inst=>{
            const total = inst.guestCount.adults + inst.guestCount.children
            const rate  = nightlyRate(room, inst.guestCount.adults, inst.guestCount.children)
            return (
              <div key={inst.cartKey} className="border border-blue-200 bg-white rounded-lg p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700">₹{rate}/night</span>
                  <button onClick={()=>onRemoveInstance(inst.cartKey)} className="text-red-400 hover:text-red-600 p-0.5 rounded transition-colors">
                    <X className="h-3.5 w-3.5"/>
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Adults</span>
                  <span className="font-bold text-gray-800">{room.occupancy?.baseAdults || 1} <span className="font-normal text-gray-400">(fixed)</span></span>
                </div>
                <Stepper
                  label="Children"
                  value={inst.guestCount.children}
                  min={0}
                  max={Math.min(room.occupancy?.maximumChildren)}
                  onChange={v=>onGuestChange(inst.cartKey,"children",v)}
                />
                {total >= maxOcc && (
                  <p className="text-xs text-orange-500 text-center">Max {maxOcc} guests per room</p>
                )}
              </div>
            )
          })}

          <button onClick={()=>onAddInstance(room)}
            className="w-full py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
            style={{background:BLUE}}>
            {has ? <><Copy className="h-3.5 w-3.5"/> Add Another</> : <><Plus className="h-3.5 w-3.5"/> Add Room</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Floating Cart Bar ────────────────────────────────────────────────────────
function CartBar({ cart, rooms, onProceed, onClear }) {
  const totalAdults   = cart.reduce((s,c)=>s+c.guestCount.adults,0)
  const totalChildren = cart.reduce((s,c)=>s+c.guestCount.children,0)
  const totalNightly  = cart.reduce((s,c)=>{
    const r=rooms?.find(r=>r._id===c.roomId)
    return r?s+nightlyRate(r,c.guestCount.adults,c.guestCount.children):s
  },0)
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
      <div className="text-white rounded-xl shadow-2xl px-5 py-3.5 flex items-center gap-4" style={{background:BLUE}}>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <ShoppingCart className="h-5 w-5 text-yellow-300"/>
            <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-blue-900 text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">{cart.length}</span>
          </div>
          <div>
            <p className="text-sm font-bold">{cart.length} room{cart.length>1?"s":""}</p>
            <p className="text-xs text-blue-300">{totalAdults}A{totalChildren>0?` · ${totalChildren}C`:""}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-blue-300">Total/night</p>
            <p className="font-bold text-yellow-300 text-base">₹{totalNightly}</p>
          </div>
          <button onClick={onClear} className="text-xs text-blue-300 hover:text-white border border-blue-400 px-2.5 py-1.5 rounded-lg transition-colors">Clear</button>
          <button onClick={onProceed} className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold text-sm px-5 py-2 rounded-xl transition-colors">
            Confirm →
          </button>
        </div>
      </div>
    </div>
  )
}


// ─── Booking Summary Panel ────────────────────────────────────────────────────
function BookingSummary({ cart, rooms }) {
  if (!cart.length) return null
  return (
    <div className="rounded-xl border-2 overflow-hidden mt-2" style={{borderColor: BLUE}}>
      <div className="text-white text-sm font-bold px-4 py-2.5 flex items-center gap-2" style={{background: BLUE}}>
        <ShoppingCart className="h-4 w-4 text-yellow-300"/>
        Booking Summary — {cart.length} room{cart.length > 1 ? "s" : ""} selected
      </div>
      <div className="divide-y divide-gray-100">
        {cart.map((inst, idx) => {
          const room = rooms?.find(r => r._id === inst.roomId)
          if (!room) return null
          const rate = nightlyRate(room, inst.guestCount.adults, inst.guestCount.children)
          return (
            <div key={inst.cartKey} className="px-4 py-3 flex items-center gap-4 bg-white hover:bg-blue-50/40 transition-colors">
              <div className="flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold shrink-0" style={{background: BLUE}}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{room.roomName}</p>
                <div className="flex flex-wrap gap-2 mt-0.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3"/>Capacity: up to {room.occupancy?.maximumOccupancy} guests</span>
                  <span className="flex items-center gap-1"><Bed className="h-3 w-3"/>{room.beds?.map(b => `${b.count} ${b.bedType}`).join(", ")}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-bold" style={{color: BLUE}}>₹{rate}</p>
                <p className="text-xs text-gray-400">per night</p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-500">Total per night</span>
        <span className="text-lg font-bold" style={{color: BLUE}}>₹{cart.reduce((s, c) => { const r = rooms?.find(r => r._id === c.roomId); return r ? s + nightlyRate(r, c.guestCount.adults, c.guestCount.children) : s }, 0)}</span>
      </div>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function RoomsSection({ data, rooms }) {
  const [cart, setCart]             = useState([])
  const [detailRoom, setDetailRoom] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const pathName = usePathname()
  const { isAuthenticated } = useSelector((state) => state.auth)

  // Restore from sessionStorage on mount so back-navigation doesn't clear selection
  useEffect(() => {
    const saved = loadCart()
    if (saved.length > 0) setCart(saved)
  }, [])

  useEffect(() => { saveCart(cart) }, [cart])

  const addInstance = useCallback((room) => {
    setCart(prev => [...prev, {
      cartKey:    `${room._id}_${Date.now()}`,
      roomId:     room._id,
      roomName:   room.roomName,
      guestCount: { adults: room.occupancy?.baseAdults || 1, children: 0 },
    }])
  }, [])

  const removeInstance = useCallback((cartKey) => {
    setCart(prev => prev.filter(c => c.cartKey !== cartKey))
  }, [])

  const changeGuests = useCallback((cartKey, type, value) => {
    setCart(prev => prev.map(c => {
      if (c.cartKey !== cartKey) return c
      const room   = rooms?.find(r => r._id === c.roomId)
      const maxOcc = room?.occupancy?.maximumOccupancy
      const other  = type === "adults" ? c.guestCount.children : c.guestCount.adults
      const capped = Math.min(value, maxOcc - other)
      const final  = Math.max(type === "adults" ? 1 : 0, capped)
      return { ...c, guestCount: { ...c.guestCount, [type]: final } }
    }))
  }, [rooms])

  const getInstances = (roomId) => cart.filter(c => c.roomId === roomId)

  const handleProceed = () => {
    if (!isAuthenticated) localStorage.setItem("hoteldetailPath", pathName)
    setConfirmOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Available Rooms</h2>
          <p className="text-sm text-gray-400 mt-0.5">Add one or more rooms — same type can be added multiple times</p>
        </div>
        <span className="text-sm font-medium px-3 py-1.5 rounded-full border" style={{color:BLUE, background:"#e8edf8", borderColor:"#bfdbfe"}}>
          {rooms?.length} room{rooms?.length!==1?"s":""} available
        </span>
      </div>

      {cart.length === 0 && (
        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-xl px-4 py-3">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0"/>
          <p>You can select <strong>multiple rooms</strong>, even the same type twice. Set guests per room after adding. Total is capped by each room's maximum occupancy.</p>
        </div>
      )}

      <div className="space-y-4">
        {rooms?.map(room => (
          <RoomCard
            key={room._id}
            room={room}
            instances={getInstances(room._id)}
            onAddInstance={addInstance}
            onRemoveInstance={removeInstance}
            onGuestChange={changeGuests}
            onViewDetails={setDetailRoom}
          />
        ))}
      </div>

      <BookingSummary cart={cart} rooms={rooms} />

      <RoomDetailModal
        room={detailRoom}
        open={!!detailRoom}
        onClose={()=>setDetailRoom(null)}
        cartItems={cart}
        onAddInstance={addInstance}
        onRemoveInstance={removeInstance}
        onGuestChange={changeGuests}
      />

      {cart.length > 0 && (
        <CartBar cart={cart} rooms={rooms} onProceed={handleProceed} onClear={()=>setCart([])}/>
      )}

      <BookingConfirmationDialog
        selectedRooms={cart}
        rooms={rooms}
        property={data}
        open={confirmOpen}
        onClose={()=>setConfirmOpen(false)}
      />
    </div>
  )
}
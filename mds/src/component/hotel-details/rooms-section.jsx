"use client"
import { useState, useMemo, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { checkRoomAvailability } from "@/redux/features/rooms/roomSlice"
import {
  Users, Bed, Bath, Square, Wifi, Tv, Wind,
  X, ChevronLeft, ChevronRight, Plus, Minus,
  ShoppingCart, Check, Info, Layers, Coffee,
  Shield, Utensils, AlertCircle, Copy, Car,
  Lock, Droplets, Tag, CalendarDays
} from "lucide-react"
import BookingConfirmationDialog from "./BookingConfirmationDialog"

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BLUE = "#1035ac"

const amenityIcon = (name) => {
  const n = name.toLowerCase()
  if (n.includes("wifi"))                        return <Wifi     className="h-3 w-3" />
  if (n.includes("tv"))                          return <Tv       className="h-3 w-3" />
  if (n.includes("air") || n.includes("ac"))     return <Wind     className="h-3 w-3" />
  if (n.includes("coffee") || n.includes("tea")) return <Coffee   className="h-3 w-3" />
  if (n.includes("safe") || n.includes("lock"))  return <Shield   className="h-3 w-3" />
  if (n.includes("meal") || n.includes("food") || n.includes("restaurant") || n.includes("bhoj")) return <Utensils className="h-3 w-3" />
  if (n.includes("park"))                        return <Car      className="h-3 w-3" />
  if (n.includes("locker"))                      return <Lock     className="h-3 w-3" />
  if (n.includes("geyser") || n.includes("water")) return <Droplets className="h-3 w-3" />
  return <Tag className="h-3 w-3" />
}

/**
 * nightlyRate — computes the live rate for a room given guest inputs.
 *
 * Pricing model:
 *  • baseAdultsCharge applies for adults up to bed capacity
 *    (sum of each bed's count × accommodates).
 *  • Adults beyond bed capacity require floor mats.
 *    mats needed = ceil(extraAdults / peoplePerFloorBedding)
 *    each mat costs extraFloorBeddingCharge.
 *  • extraGaddis = additional floor mats added manually, also charged per mat.
 */
const nightlyRate = (room, adults, extraGaddis = 0) => {
  if (!room) return 0
  const bedCapacity   = room?.beds?.reduce((s, b) => s + (b.count * b.accommodates), 0) || 1
  const perGaddi      = parseInt(room?.FloorBedding?.peoplePerFloorBedding || 1)
  const gaddiRate     = room.pricing?.extraFloorBeddingCharge || 0
  const extraAdults   = Math.max(0, adults - bedCapacity)
  const matsForAdults = extraAdults > 0 ? Math.ceil(extraAdults / perGaddi) : 0
  return (room.pricing?.baseAdultsCharge || 0) + (matsForAdults + extraGaddis) * gaddiRate
}

/** Total people in a booking instance (adults + gaddi people) */
const totalPeople = (room, adults, extraGaddis) => {
  const perGaddi = parseInt(room?.FloorBedding?.peoplePerFloorBedding || 1)
  return adults + extraGaddis * perGaddi
}

/** Max gaddis a user can manually add (independent of adults) */
const maxGaddis = (room) => parseInt(room?.FloorBedding?.count || 0)

/** Compute displayed max occupancy as bed slots + all gaddi slots */
const displayMaxOccupancy = (room) => {
  const bedSlots   = room?.beds?.reduce((s, b) => s + (b.count * b.accommodates), 0) || 0
  const gaddiSlots = parseInt(room?.FloorBedding?.count || 0) * parseInt(room?.FloorBedding?.peoplePerFloorBedding || 1)
  return bedSlots + gaddiSlots
}

const CART_KEY = "roomsCart_v3"
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
          <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length) }}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full">
            <ChevronLeft className="h-3 w-3" />
          </button>
          <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length) }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full">
            <ChevronRight className="h-3 w-3" />
          </button>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === idx ? "bg-white" : "bg-white/40"}`} />)}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Amenity Chips — shows name + options + suboptions ────────────────────────
function AmenityChips({ amenities, limit = 6 }) {
  const items = []
  if (!amenities) return null
  for (const cat of ["mandatory", "popularWithGuests", "basicFacilities", "bathroom", "roomFeatures"]) {
    if (!amenities[cat]) continue
    for (const [k, v] of Object.entries(amenities[cat])) {
      if (!v?.available) continue
      const baseName = k.replace(/([A-Z])/g, " $1").trim()
      const details  = []
      if (v.option?.length)     details.push(v.option.join(" / "))
      if (v.subOptions?.length) details.push(v.subOptions.join(", "))
      items.push({ key: k, label: baseName, detail: details.join(" · ") })
    }
  }
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {items.slice(0, limit).map(({ key, label, detail }) => (
        <span key={key} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
          {amenityIcon(key)}
          <span className="font-medium">{label}</span>
          {detail && <span className="text-blue-400 font-normal">({detail})</span>}
        </span>
      ))}
      {items.length > limit && <span className="text-xs text-gray-400 self-center">+{items.length - limit} more</span>}
    </div>
  )
}

// ─── Property Amenity Row — for detail modal (shows full options) ──────────────
function PropertyAmenityList({ amenities }) {
  if (!amenities) return null
  const cats = {
    "Basic Facilities": "basicFacilities",
    "General Services": "generalServices",
    "Common Area": "commonArea",
    "Food & Beverages": "foodBeverages",
    "Health & Wellness": "healthWellness",
    "Security": "security",
    "Safety": "safety",
  }
  const rendered = []
  for (const [label, key] of Object.entries(cats)) {
    if (!amenities[key]) continue
    const avail = Object.entries(amenities[key]).filter(([, v]) => v?.available)
    if (!avail.length) continue
    rendered.push(
      <div key={key}>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</p>
        <div className="flex flex-wrap gap-1.5">
          {avail.map(([n, v]) => {
            const baseName = n.replace(/([A-Z])/g, " $1").trim()
            const opts = []
            if (v.option?.length)     opts.push(v.option.join(" / "))
            if (v.subOptions?.length) opts.push(v.subOptions.join(", "))
            const detail = opts.join(" · ")
            return (
              <span key={n} className="flex items-center gap-1 text-xs bg-gray-50 border border-gray-200 text-gray-700 px-2.5 py-1 rounded-full">
                {amenityIcon(n)}
                <span className="font-medium">{baseName}</span>
                {detail && <span className="text-gray-400">· {detail}</span>}
              </span>
            )
          })}
        </div>
      </div>
    )
  }
  return <div className="space-y-3">{rendered}</div>
}

// ─── Stepper ──────────────────────────────────────────────────────────────────
function Stepper({ label, sublabel, value, min, max, onChange, accent }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div>
        <span className="text-gray-600 font-medium">{label}</span>
        {sublabel && <span className="text-gray-400 ml-1">({sublabel})</span>}
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
          className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-30 hover:border-blue-500 transition-colors">
          <Minus className="h-2.5 w-2.5" />
        </button>
        <span className="w-5 text-center font-bold text-gray-800">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
          className={`w-5 h-5 rounded-full border flex items-center justify-center disabled:opacity-30 transition-colors ${accent ? "border-amber-400 hover:bg-amber-50" : "border-gray-300 hover:border-blue-500"}`}>
          <Plus className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Room Detail Drawer ───────────────────────────────────────────────────────
function RoomDetailModal({ room, open, onClose, cartItems, onAddInstance, onRemoveInstance, onGuestChange,
  availableUnits: availableUnitsProp,
  totalUnits:     totalUnitsProp,
}) {
  if (!room || !open) return null
  const instances      = cartItems.filter(c => c.roomId === room._id)
  const maxOcc         = displayMaxOccupancy(room)
  const availableUnits = availableUnitsProp ?? room.availableUnits ?? room.numberRoom ?? 1
  const totalUnits     = totalUnitsProp     ?? room.numberRoom ?? 1
  const bedSlots   = room?.beds?.reduce((s, b) => s + (b.count * b.accommodates), 0) || 0
  const gaddiCount = parseInt(room?.FloorBedding?.count || 0)
  const perGaddi   = parseInt(room?.FloorBedding?.peoplePerFloorBedding || 1)
  const gaddiSlots = gaddiCount * perGaddi

  const cats = {
    "Basic Facilities": "basicFacilities",
    "General Services": "generalServices",
    "Room Features": "roomFeatures",
    "Kitchen": "kitchenAppliances",
    "Safety": "safetyAndSecurity",
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-5 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{room.roomName}</h2>
            <p className="text-xs text-gray-400">Room #{room.numberRoom}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-5 space-y-5">
          <ImageCarousel images={room.media?.images} size="large" />

          {/* Stats grid — max occupancy shows breakdown */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="flex flex-col items-center bg-blue-50 rounded-lg py-2 px-1">
              <span className="text-xs text-gray-400">Size</span>
              <span className="text-sm font-semibold" style={{ color: BLUE }}>{room.roomSize}{room.sizeUnit}</span>
            </div>
            <div className="flex flex-col items-center bg-blue-50 rounded-lg py-2 px-1 col-span-2 sm:col-span-1">
              <span className="text-xs text-gray-400 text-center">Max Occupancy</span>
              <span className="text-sm font-semibold text-center" style={{ color: BLUE }}>
                {maxOcc} guests
              </span>
              <span className="text-xs text-gray-400 text-center leading-tight mt-0.5">
                {bedSlots} bed{bedSlots !== 1 ? "s" : ""}
                {gaddiSlots > 0 && ` + ${gaddiCount} gaddi×${perGaddi}`}
              </span>
            </div>
            <div className="flex flex-col items-center bg-blue-50 rounded-lg py-2 px-1">
              <span className="text-xs text-gray-400">Bathroom</span>
              <span className="text-sm font-semibold" style={{ color: BLUE }}>
                {room.bathrooms?.private ? "Private" : "Shared"}
              </span>
            </div>
            <div className="flex flex-col items-center bg-blue-50 rounded-lg py-2 px-1">
              <span className="text-xs text-gray-400">Rooms</span>
              <span className="text-sm font-semibold" style={{ color: BLUE }}>{room.numberRoom}</span>
            </div>
          </div>

          {room.description && <p className="text-sm text-gray-500 leading-relaxed">{room.description}</p>}

          {/* Beds */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
              <Bed className="h-4 w-4 text-blue-600" /> Beds
            </p>
            <div className="flex flex-wrap gap-1.5">
              {room.beds?.map((b, i) => (
                <span key={i} className="text-xs bg-blue-50 border border-blue-200 text-blue-800 px-2.5 py-1 rounded-full">
                  {b.count}× {b.bedType} (fits {b.accommodates})
                </span>
              ))}
            </div>
          </div>

          {/* Floor bedding / Gaddi — with price */}
          {room.FloorBedding?.available && (
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 space-y-1">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="text-sm text-amber-800 font-semibold">Floor Bedding (Gaddi)</span>
              </div>
              <div className="pl-6 space-y-0.5 text-xs text-amber-700">
                <p>{gaddiCount} mat{gaddiCount !== 1 ? "s" : ""} · {perGaddi} person/mat</p>
                <p>
                  Total gaddi capacity: <strong>{gaddiSlots} person{gaddiSlots !== 1 ? "s" : ""}</strong>
                </p>
                {room.pricing?.extraFloorBeddingCharge > 0 && (
                  <p className="font-semibold text-amber-600">
                    +₹{room.pricing.extraFloorBeddingCharge} per mat per night
                  </p>
                )}
              </div>
            </div>
          )}

          {room.mealPlan?.available && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-100 flex items-center gap-2">
              <Utensils className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800 font-medium">{room.mealPlan.planType || "Meal Plan Included"}</span>
            </div>
          )}

          {/* Room amenities with options/suboptions */}
          {Object.entries(cats).map(([label, key]) => {
            if (!room.amenities?.[key]) return null
            const avail = Object.entries(room.amenities[key]).filter(([, v]) => v?.available)
            if (!avail.length) return null
            return (
              <div key={key}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {avail.map(([n, v]) => {
                    const baseName = n.replace(/([A-Z])/g, " $1").trim()
                    const opts = []
                    if (v.option?.length)     opts.push(v.option.join(" / "))
                    if (v.subOptions?.length) opts.push(v.subOptions.join(", "))
                    const detail = opts.join(" · ")
                    return (
                      <span key={n} className="flex items-center gap-1 text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
                        {amenityIcon(n)}
                        <span className="font-medium">{baseName}</span>
                        {detail && <span className="text-gray-400 text-xs">· {detail}</span>}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Pricing */}
          <div className="rounded-xl p-4 text-white" style={{ background: BLUE }}>
            <p className="font-semibold mb-2 text-sm">Pricing per night</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-200">Base (up to {room?.beds?.reduce((s, b) => s + (b.count * b.accommodates), 0) || 1} guest{(room?.beds?.reduce((s, b) => s + (b.count * b.accommodates), 0) || 1) !== 1 ? "s" : ""} on bed)</span>
                <span className="font-bold text-yellow-300">₹{room.pricing?.baseAdultsCharge}</span>
              </div>
              {room.FloorBedding?.available && (
                <div className="flex justify-between">
                  <span className="text-blue-200">Extra guest / floor mat ({room.FloorBedding.peoplePerFloorBedding}p per mat)</span>
                  <span className="text-yellow-200">+₹{room.pricing?.extraFloorBeddingCharge || 0}/mat</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer — booking controls */}
        <div className="sticky bottom-0 bg-white border-t p-4 space-y-2">
          {instances.map(inst => {
            const adults      = inst.guestCount.adults
            const extraGaddis = inst.guestCount.extraGaddis || 0
            const maxA        = room.occupancy?.maximumOccupancy - maxGaddis(room) || 1
            const maxG        = maxGaddis(room)
            const rate        = nightlyRate(room, adults, extraGaddis)
            const total       = totalPeople(room, adults, extraGaddis)
            const maxOccupancy = room.occupancy?.maximumOccupancy || 1
            return (
              <div key={inst.cartKey} className="border border-blue-200 bg-blue-50/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700">₹{rate}/night · {total} guest{total !== 1 ? "s" : ""}</span>
                  <button onClick={() => onRemoveInstance(inst.cartKey)} className="text-xs text-red-400 hover:text-red-600 border border-red-100 px-2 py-0.5 rounded bg-white">Remove</button>
                </div>
                <Stepper
                  label="Adults"
                  sublabel={`base ${room.occupancy?.baseAdults}`}
                  value={adults}
                  min={1}
                  max={maxA}
                  onChange={v => onGuestChange(inst.cartKey, "adults", v)}
                />
                {room.FloorBedding?.available && (
                  <Stepper
                    label="Floor Mats (Gaddi)"
                    sublabel={`₹${room.pricing?.extraFloorBeddingCharge || 0}/mat`}
                    value={extraGaddis}
                    min={0}
                    max={maxG}
                    onChange={v => onGuestChange(inst.cartKey, "extraGaddis", v)}
                    accent
                  />
                )}
                {total >= maxOccupancy && (
                  <p className="text-xs text-orange-500 text-center">Max {maxOccupancy} guests reached</p>
                )}
              </div>
            )
          })}
          {/* Modal date-aware availability badge */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              <strong className={availableUnits === 0 ? "text-red-500" : availableUnits <= 1 ? "text-orange-500" : "text-green-600"}>
                {availableUnits}
              </strong>
              {" "}of {totalUnits} unit{totalUnits !== 1 ? "s" : ""} free for your dates
            </span>
            {instances.length >= availableUnits && <span className="text-orange-500 font-medium">Fully selected</span>}
          </div>
          <button
            onClick={() => onAddInstance(room)}
            disabled={instances.length >= availableUnits}
            className="w-full text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: BLUE }}>
            {instances.length >= availableUnits
              ? <><AlertCircle className="h-4 w-4" /> No Units Left</>
              : <><Plus className="h-4 w-4" /> {instances.length > 0 ? "Add Room Again" : "Add Room"}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Room Card ────────────────────────────────────────────────────────────────
function RoomCard({ room, instances, onAddInstance, onRemoveInstance, onGuestChange, onViewDetails,
  availableUnits: availableUnitsProp,
  totalUnits:     totalUnitsProp,
  availabilityLoading = false,
}) {
  const has            = instances.length > 0
  const maxOcc         = displayMaxOccupancy(room)
  // Prefer date-aware prop from parent; fallback to room.numberRoom
  const availableUnits = availableUnitsProp ?? room.availableUnits ?? room.numberRoom ?? 1
  const totalUnits     = totalUnitsProp     ?? room.numberRoom ?? 1
  const cartFull       = instances.length >= availableUnits

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden border-2 transition-all duration-200 ${has ? "shadow-md" : "border-gray-200 hover:border-blue-200 hover:shadow-sm"}`}
      style={has ? { borderColor: BLUE } : {}}>

      {has && (
        <div className="text-white text-xs font-semibold px-4 py-1.5 flex items-center gap-1.5" style={{ background: BLUE }}>
          <Check className="h-3 w-3" /> {instances.length} selection{instances.length > 1 ? "s" : ""} added to booking
        </div>
      )}

      <div className="grid md:grid-cols-[250px_1fr_220px]">
        {/* Image */}
        <div className="p-3">
          <ImageCarousel images={room.media?.images} onClick={() => onViewDetails(room)} />
        </div>

        {/* Details */}
        <div className="p-4 pr-2">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="text-base font-bold text-gray-900">{room.roomName}</h3>
              <p className="text-xs text-gray-400">Room #{room.numberRoom}</p>
            </div>
            <button onClick={() => onViewDetails(room)}
              className="shrink-0 text-xs border text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg flex items-center gap-1 mt-0.5 transition-colors"
              style={{ borderColor: "#bfdbfe" }}>
              <Info className="h-3 w-3" /> Details
            </button>
          </div>

          {room.description && <p className="text-xs text-gray-400 mb-2 line-clamp-2">{room.description}</p>}

          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Square className="h-3 w-3 text-gray-300" />{room.roomSize}{room.sizeUnit}</span>
            <span className="flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              <Users className="h-3 w-3" />Max: {maxOcc} guests
            </span>
            <span className="flex items-center gap-1"><Bed className="h-3 w-3 text-gray-300" />{room.beds?.map(b => `${b.count} ${b.bedType}`).join(", ")}</span>
            <span className="flex items-center gap-1"><Bath className="h-3 w-3 text-gray-300" />{room.bathrooms?.count} {room.bathrooms?.private ? "Private" : "Shared"}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {room.FloorBedding?.available && (
              <span className="flex items-center gap-1 text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full">
                <Layers className="h-3 w-3" />
                {room.FloorBedding.count} Gaddi · {room.FloorBedding.peoplePerFloorBedding}p/mat
                {room.pricing?.extraFloorBeddingCharge > 0 && (
                  <span className="text-amber-500 font-semibold"> · +₹{room.pricing.extraFloorBeddingCharge}/mat</span>
                )}
              </span>
            )}
            {room.mealPlan?.available && (
              <span className="flex items-center gap-1 text-xs bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full">
                <Utensils className="h-3 w-3" /> {room.mealPlan.planType || "Meal Plan"}
              </span>
            )}
          </div>

          <AmenityChips amenities={room.amenities} limit={6} />
        </div>

        {/* Pricing + CTA */}
        <div className="p-4 bg-gray-50 border-l border-gray-100 flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-400">Base rate / night</p>
            <p className="text-xl font-bold text-gray-900">₹{room.pricing?.baseAdultsCharge}</p>
            <div className="space-y-0.5 text-xs text-gray-400 mt-0.5">
              {room.pricing?.extraAdultsCharge > 0 && (
                <div className="flex justify-between"><span>Extra adult</span><span>+₹{room.pricing?.extraAdultsCharge}</span></div>
              )}
              {room.FloorBedding?.available && room.pricing?.extraFloorBeddingCharge > 0 && (
                <div className="flex justify-between text-amber-600 font-medium">
                  <span>Gaddi / mat</span><span>+₹{room.pricing?.extraFloorBeddingCharge}</span>
                </div>
              )}
            </div>
          </div>

          {/* Per-instance guest controls */}
          {instances.map(inst => {
            const adults      = inst.guestCount.adults
            const extraGaddis = inst.guestCount.extraGaddis || 0
            const maxA        = room.occupancy?.maximumOccupancy - maxGaddis(room) || 1
            const maxG        = maxGaddis(room)
            const rate        = nightlyRate(room, adults, extraGaddis)
            const total       = totalPeople(room, adults, extraGaddis)
            const maxOccupancy = room.occupancy?.maximumOccupancy || 1
            return (
              <div key={inst.cartKey} className="border border-blue-200 bg-white rounded-lg p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700">₹{rate}/night</span>
                  <button onClick={() => onRemoveInstance(inst.cartKey)} className="text-red-400 hover:text-red-600 p-0.5 rounded transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Adults counter */}
                <Stepper
                  label="Adults"
                  value={adults}
                  min={1}
                  max={maxA}
                  onChange={v => onGuestChange(inst.cartKey, "adults", v)}
                />

                {/* Extra Gaddi counter */}
                {room.FloorBedding?.available && (
                  <Stepper
                    label="Extra Gaddi"
                    sublabel={`₹${room.pricing?.extraFloorBeddingCharge || 0}/mat`}
                    value={extraGaddis}
                    min={0}
                    max={maxG}
                    onChange={v => onGuestChange(inst.cartKey, "extraGaddis", v)}
                    accent
                  />
                )}

                {/* Capacity bar */}
                <div className="pt-0.5">
                  <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                    <span>{total} of {maxOccupancy} guests</span>
                    <span>{maxOccupancy - total} spots left</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-1 rounded-full transition-all ${total >= maxOccupancy ? "bg-orange-400" : "bg-blue-400"}`}
                      style={{ width: `${Math.min(100, (total / maxOccupancy) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}

          {/* Date-aware availability badge */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            {availabilityLoading
              ? <span className="animate-pulse text-blue-400">Checking availability…</span>
              : <span>
                  <strong className={availableUnits === 0 ? "text-red-500" : availableUnits <= 1 ? "text-orange-500" : "text-green-600"}>
                    {availableUnits}
                  </strong>
                  {" "}of {totalUnits} unit{totalUnits !== 1 ? "s" : ""} free for your dates
                </span>
            }
            {!availabilityLoading && cartFull && (
              <span className="text-orange-500 font-medium">All units selected</span>
            )}
          </div>
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className={`h-1 rounded-full transition-all ${
                availabilityLoading ? "bg-blue-200 animate-pulse w-full" :
                cartFull            ? "bg-orange-400" : "bg-green-400"
              }`}
              style={availabilityLoading ? {} : { width: `${Math.min(100, ((totalUnits - availableUnits) / totalUnits) * 100)}%` }}
            />
          </div>
          <button
            onClick={() => onAddInstance(room)}
            disabled={cartFull}
            className="w-full py-2 rounded-lg text-sm font-semibold text-white transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
            style={{ background: BLUE }}>
            {cartFull
              ? <><AlertCircle className="h-3.5 w-3.5" /> No Units Left</>
              : has
                ? <><Copy className="h-3.5 w-3.5" /> Add Another</>
                : <><Plus className="h-3.5 w-3.5" /> Add Room</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Floating Cart Bar ────────────────────────────────────────────────────────
function CartBar({ cart, rooms, onProceed, onClear }) {
  const totalAdults = cart.reduce((s, c) => s + (c.guestCount.adults || 0), 0)
  const totalGaddis = cart.reduce((s, c) => s + (c.guestCount.extraGaddis || 0), 0)
  const totalNightly = cart.reduce((s, c) => {
    const r = rooms?.find(r => r._id === c.roomId)
    return r ? s + nightlyRate(r, c.guestCount.adults, c.guestCount.extraGaddis || 0) : s
  }, 0)
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
      <div className="text-white rounded-xl shadow-2xl px-5 py-3.5 flex items-center gap-4" style={{ background: BLUE }}>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <ShoppingCart className="h-5 w-5 text-yellow-300" />
            <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-blue-900 text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">{cart.length}</span>
          </div>
          <div>
            <p className="text-sm font-bold">{cart.length} room{cart.length > 1 ? "s" : ""}</p>
            <p className="text-xs text-blue-300">
              {totalAdults} adult{totalAdults > 1 ? "s" : ""}
              {totalGaddis > 0 && ` · ${totalGaddis} gaddi`}
            </p>
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
    <div className="rounded-xl border-2 overflow-hidden mt-2" style={{ borderColor: BLUE }}>
      <div className="text-white text-sm font-bold px-4 py-2.5 flex items-center gap-2" style={{ background: BLUE }}>
        <ShoppingCart className="h-4 w-4 text-yellow-300" />
        Booking Summary — {cart.length} room{cart.length > 1 ? "s" : ""} selected
      </div>
      <div className="divide-y divide-gray-100">
        {cart.map((inst, idx) => {
          const room = rooms?.find(r => r._id === inst.roomId)
          if (!room) return null
          const adults      = inst.guestCount.adults || 1
          const extraGaddis = inst.guestCount.extraGaddis || 0
          const rate        = nightlyRate(room, adults, extraGaddis)
          const total       = totalPeople(room, adults, extraGaddis)
          return (
            <div key={inst.cartKey} className="px-4 py-3 flex items-center gap-4 bg-white hover:bg-blue-50/40 transition-colors">
              <div className="flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold shrink-0" style={{ background: BLUE }}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{room.roomName}</p>
                <div className="flex flex-wrap gap-2 mt-0.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {adults} adult{adults > 1 ? "s" : ""}
                    {extraGaddis > 0 && ` · ${extraGaddis} gaddi`}
                    {" "}({total} total)
                  </span>
                  <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{room.beds?.map(b => `${b.count} ${b.bedType}`).join(", ")}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-bold" style={{ color: BLUE }}>₹{rate}</p>
                <p className="text-xs text-gray-400">per night</p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-500">Total per night</span>
        <span className="text-lg font-bold" style={{ color: BLUE }}>
          ₹{cart.reduce((s, c) => {
            const r = rooms?.find(r => r._id === c.roomId)
            return r ? s + nightlyRate(r, c.guestCount.adults, c.guestCount.extraGaddis || 0) : s
          }, 0)}
        </span>
      </div>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function RoomsSection({ data, rooms }) {
  const [cart, setCart]             = useState([])
  const [detailRoom, setDetailRoom] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  // availabilityMap: { [roomId]: { availableUnits: number, totalUnits: number } }
  const [availabilityMap, setAvailabilityMap]   = useState({})
  const [availabilityLoading, setAvailabilityLoading] = useState(false)

  const pathName = usePathname()
  const dispatch = useDispatch()
  const { isAuthenticated }     = useSelector((state) => state.auth)
  const { searchQuery }         = useSelector((s) => s.property)

  // Derive dates from Redux searchQuery (same source as BookingConfirmationDialog)
  const searchCheckIn  = searchQuery?.checkin  ? new Date(searchQuery.checkin)  : null
  const searchCheckOut = searchQuery?.checkout ? new Date(searchQuery.checkout) : null
  const hasDates       = !!(searchCheckIn && searchCheckOut)

  // Fetch availability for every room whenever rooms or dates change
  useEffect(() => {
    if (!rooms?.length || !hasDates) return

    let cancelled = false
    const fetchAll = async () => {
      setAvailabilityLoading(true)
      const map = {}
      await Promise.all(
        rooms.map(async (room) => {
          try {
            const result = await dispatch(
              checkRoomAvailability({
                roomId:    room._id,
                startDate: searchCheckIn.toISOString().split("T")[0],
                endDate:   searchCheckOut.toISOString().split("T")[0],
              })
            ).unwrap()
            map[room._id] = {
              availableUnits: result?.data?.availableUnits ?? room.numberRoom ?? 1,
              totalUnits:     result?.data?.totalUnits     ?? room.numberRoom ?? 1,
            }
          } catch {
            // Fallback to numberRoom if API fails
            map[room._id] = {
              availableUnits: room.numberRoom ?? 1,
              totalUnits:     room.numberRoom ?? 1,
            }
          }
        })
      )
      if (!cancelled) {
        setAvailabilityMap(map)
        setAvailabilityLoading(false)
      }
    }
    fetchAll()
    return () => { cancelled = true }
  }, [rooms, searchQuery?.checkin, searchQuery?.checkout])

  // Helper: get date-aware availableUnits for a room
  const getAvailableUnits = (room) =>
    availabilityMap[room._id]?.availableUnits ?? room.numberRoom ?? 1
  const getTotalUnits = (room) =>
    availabilityMap[room._id]?.totalUnits ?? room.numberRoom ?? 1

  useEffect(() => {
    const saved = loadCart()
    if (saved.length > 0) setCart(saved)
  }, [])

  useEffect(() => { saveCart(cart) }, [cart])

  const addInstance = useCallback((room) => {
    setCart(prev => {
      const alreadyInCart  = prev.filter(c => c.roomId === room._id).length
      // Use date-aware availableUnits from the map; fallback to numberRoom
      const availableUnits = availabilityMap[room._id]?.availableUnits ?? room.numberRoom ?? 1
      if (alreadyInCart >= availableUnits) return prev
      return [...prev, {
        cartKey:    `${room._id}_${Date.now()}`,
        roomId:     room._id,
        roomName:   room.roomName,
        guestCount: { adults: 1, extraGaddis: 0 },
      }]
    })
  // availabilityMap must be in deps so the guard always uses latest values
  }, [availabilityMap])

  const removeInstance = useCallback((cartKey) => {
    setCart(prev => prev.filter(c => c.cartKey !== cartKey))
  }, [])

  const changeGuests = useCallback((cartKey, type, value) => {
    setCart(prev => prev.map(c => {
      if (c.cartKey !== cartKey) return c
      const room     = rooms?.find(r => r._id === c.roomId)
      const maxOcc   = room?.occupancy?.maximumOccupancy || 1
      const gaddiCap = parseInt(room?.FloorBedding?.count || 0)

      let adults      = c.guestCount.adults || 1
      let extraGaddis = c.guestCount.extraGaddis || 0

      if (type === "adults") {
        adults = Math.max(1, Math.min(maxOcc, value))
      } else if (type === "extraGaddis") {
        extraGaddis = Math.max(0, Math.min(gaddiCap, value))
      }

      return { ...c, guestCount: { adults, extraGaddis } }
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
        <span className="text-sm font-medium px-3 py-1.5 rounded-full border" style={{ color: BLUE, background: "#e8edf8", borderColor: "#bfdbfe" }}>
          {rooms?.length} room{rooms?.length !== 1 ? "s" : ""} available
        </span>
      </div>

      {cart.length === 0 && (
        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-xl px-4 py-3">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>You can select <strong>multiple rooms</strong>, even the same type twice. Adjust adults and extra floor mats per room. Total is capped by each room's maximum occupancy.</p>
        </div>
      )}

      {/* Date-aware availability banner */}
      {hasDates && (
        <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span>
            Showing availability for{" "}
            <strong>{searchCheckIn.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</strong>
            {" → "}
            <strong>{searchCheckOut.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong>
            {availabilityLoading && <span className="ml-1 text-blue-400 animate-pulse">· checking…</span>}
          </span>
        </div>
      )}

      <div className="space-y-4">
        {rooms?.map(room => (
          <RoomCard
            key={room._id}
            room={room}
            instances={getInstances(room._id)}
            availableUnits={getAvailableUnits(room)}
            totalUnits={getTotalUnits(room)}
            availabilityLoading={availabilityLoading}
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
        onClose={() => setDetailRoom(null)}
        cartItems={cart}
        availableUnits={detailRoom ? getAvailableUnits(detailRoom) : 1}
        totalUnits={detailRoom ? getTotalUnits(detailRoom) : 1}
        onAddInstance={addInstance}
        onRemoveInstance={removeInstance}
        onGuestChange={changeGuests}
      />

      {cart.length > 0 && (
        <CartBar cart={cart} rooms={rooms} onProceed={handleProceed} onClear={() => setCart([])} />
      )}

      <BookingConfirmationDialog
        selectedRooms={cart}
        rooms={rooms}
        property={data}
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  )
}
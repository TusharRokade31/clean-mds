"use client"

import { Title } from "@mui/icons-material"
import { Badge, Button, Card, CardContent, CardHeader } from "@mui/material"
import {
  Wifi,
  Car,
  Wind,
  Shirt,
  Newspaper,
  Phone,
  Shield,
  Camera,
  Utensils,
  FireExtinguisher,
  Luggage,
  CheckCircle,
  Plus,
} from "lucide-react"
import { useState } from "react"




export default function AmenitiesSection({ amenities }) {
  const [showAllAmenities, setShowAllAmenities] = useState(false)

  const getAmenityIcon = (amenityName) => {
    const name = amenityName.toLowerCase()
    switch (name) {
      case "wifi":
        return <Wifi className="h-4 w-4" />
      case "parking":
        return <Car className="h-4 w-4" />
      case "airconditioning":
        return <Wind className="h-4 w-4" />
      case "laundry":
        return <Shirt className="h-4 w-4" />
      case "newspaper":
        return <Newspaper className="h-4 w-4" />
      case "roomservice":
        return <Phone className="h-4 w-4" />
      case "smokedetector":
        return <Shield className="h-4 w-4" />
      case "cctv":
        return <Camera className="h-4 w-4" />
      case "restaurantbhojnalay":
        return <Utensils className="h-4 w-4" />
      case "fireextinguishers":
        return <FireExtinguisher className="h-4 w-4" />
      case "luggageassistance":
        return <Luggage className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const formatAmenityName = (name) => {
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  const renderAmenityItem = (name, amenity) => {
    if (!amenity.available) return null

    return (
      <div key={name} className="flex items-start gap-3 p-3 rounded-lg border">
        <div className="flex-shrink-0 mt-0.5">{getAmenityIcon(name)}</div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{formatAmenityName(name)}</h4>
          {amenity.option.length > 0 && (
            <div className="mt-1">
              {amenity.option.map((option, index) => (
                <Badge key={index} variant="outline" className="text-xs mr-1">
                  {option}
                </Badge>
              ))}
            </div>
          )}
          {amenity.subOptions.length > 0 && (
            <div className="mt-1">
              <p className="text-xs text-gray-600">{amenity.subOptions.join(", ")}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const mandatoryAmenities = Object.entries(amenities?.mandatory || {}).filter(([_, amenity]) => amenity.available)

  const displayedAmenities = showAllAmenities ? mandatoryAmenities : mandatoryAmenities.slice(0, 8)

  return (
    <Card>
      <CardHeader>
        <Title className="flex items-center justify-between">
          <span>Amenities</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Amenities rated</span>
            <Badge variant="secondary">4.5</Badge>
            <span className="text-sm text-gray-500">by guests</span>
          </div>
        </Title>
      </CardHeader>
      <CardContent>
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayedAmenities.map(([name, amenity]) => renderAmenityItem(name, amenity))}
        </div> */}

        {mandatoryAmenities.length > 8 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAllAmenities(!showAllAmenities)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {showAllAmenities ? "Show Less" : `+${mandatoryAmenities.length - 8} More Amenities`}
            </Button>
          </div>
        )}

        {/* Popular Amenities Quick View */}
        <div className="">
          <h4 className="font-medium mb-3">Popular Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {mandatoryAmenities.slice(0, 6).map(([name]) => (
              <Badge key={name} variant="secondary" className="flex items-center gap-1">
                {getAmenityIcon(name)}
                {formatAmenityName(name)}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

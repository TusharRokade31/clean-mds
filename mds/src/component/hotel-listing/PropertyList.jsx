"use client";

import { useState } from "react";
import { List, Map } from "lucide-react";
import { PropertyCard } from "./PropertyCard";
import { Button } from "@mui/material";

export function PropertyList({
  properties = [],
  isLoading,
  error,
  hasMore,
  onLoadMore,
}) {
  const [sortBy, setSortBy] = useState("relevance");

  // Sorting the properties based on the selected sorting criteria
  const sortedProperties = properties;

  if (error) {
    return (
      <div className="flex-1">
        <div className="text-center py-8">
          <p className="text-red-600">Error loading properties: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Sort Options */}
      <div className="flex shadow-md p-4 rounded-3xl flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-md font-medium">Sort by:</span>
          <div className="flex flex-wrap gap-2">
            <Button
              sx={{
                backgroundColor:
                  sortBy === "relevance" ? "#1035ac" : "transparent",
                color: sortBy === "relevance" ? "white" : "inherit",
                "&:hover": {
                  backgroundColor:
                    sortBy === "relevance" ? "#1035ac" : "#f5f5f5",
                },
              }}
              onClick={() => setSortBy("relevance")}
            >
              Relevance
            </Button>
            <Button
              sx={{
                backgroundColor: sortBy === "price" ? "#1035ac" : "transparent",
                color: sortBy === "price" ? "white" : "inherit",
                "&:hover": {
                  backgroundColor: sortBy === "price" ? "#1035ac" : "#f5f5f5",
                },
              }}
              onClick={() => setSortBy("price")}
            >
              Price: Low to High
            </Button>
            <Button
              sx={{
                backgroundColor:
                  sortBy === "rating" ? "#1035ac" : "transparent",
                color: sortBy === "rating" ? "white" : "inherit",
                "&:hover": {
                  backgroundColor: sortBy === "rating" ? "#1035ac" : "#f5f5f5",
                },
              }}
              onClick={() => setSortBy("rating")}
            >
              Rating
            </Button>
            <Button
              sx={{
                backgroundColor:
                  sortBy === "distance" ? "#1035ac" : "transparent",
                color: sortBy === "distance" ? "white" : "inherit",
                "&:hover": {
                  backgroundColor:
                    sortBy === "distance" ? "#1035ac" : "#f5f5f5",
                },
              }}
              onClick={() => setSortBy("distance")}
            >
              Distance
            </Button>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Sorted by {capitalizeFirstLetter(sortBy)}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && properties.length === 0 && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      )}

      {/* Property Cards */}
      <div className="space-y-6">
        {sortedProperties.map((property) => (
          <PropertyCard key={property._id} {...mapPropertyData(property)} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-8">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Loading..." : "Load More Properties"}
          </Button>
        </div>
      )}

      {/* No Properties Message */}
      {!isLoading && properties.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">
            No properties found for your search criteria.
          </p>
        </div>
      )}
    </div>
  );
}

// Helper function to sort the properties based on the selected sort option
function sortProperties(properties, sortBy) {
  switch (sortBy) {
    case "price":
      return [...properties].sort((a, b) => {
        const priceA = a.rooms?.[0]?.pricing?.baseAdultsCharge || 1000;
        const priceB = b.rooms?.[0]?.pricing?.baseAdultsCharge || 1000;
        return priceA - priceB;
      });

    case "rating":
      return [...properties].sort(
        (a, b) => (b.placeRating || 4.5) - (a.placeRating || 4.5)
      );

    case "distance":
      return [...properties]; // Distance calculation can be implemented later, sorted based on some distance logic

    default:
      return properties; // Default is relevance, so no sorting is applied.
  }
}

// Helper function to map API data to component props
function mapPropertyData(property) {
  return {
    id: property._id,
    name: property.placeName,
    location: `${property.location.city}, ${property.location.state}`,
    rating: property.placeRating || 4.5,
    reviews: Math.floor(Math.random() * 200) + 50,
    price: property.rooms?.[0]?.pricing?.baseAdultsCharge || 1000,
    verified: property.status === "published",
    distance: "N/A",
    amenities: extractAmenities(property.amenities),
    tags: [property.propertyType],
    images: property.media?.images || [],
  };
}

function extractAmenities(amenities) {
  const amenityList = [];
  Object.entries(amenities || {}).forEach(([category, categoryAmenities]) => {
    Object.entries(categoryAmenities || {}).forEach(([amenity, selection]) => {
      if (selection.available) {
        amenityList.push(amenity);
      }
    });
  });
  return amenityList.slice(0, 4);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

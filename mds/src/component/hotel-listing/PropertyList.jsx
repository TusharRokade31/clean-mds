"use client";

import { useState } from "react";
import { List, Map, Tune, SwapVert } from "lucide-react";
import { PropertyCard } from "./PropertyCard";
import { Button, Modal, Box, Typography, Radio, RadioGroup, FormControlLabel } from "@mui/material";

const sortModalStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  bgcolor: 'background.paper',
  borderRadius: '16px 16px 0 0',
  boxShadow: 24,
  p: 0,
  maxHeight: '70vh',
  overflow: 'auto',
  '@media (min-width: 768px)': {
    left: '50%',
    right: 'auto',
    bottom: '50%',
    transform: 'translate(-50%, 50%)',
    borderRadius: '16px',
    maxWidth: '400px',
    width: '90%',
  }
};

export function PropertyList({
  properties = [],
  isLoading,
  error,
  hasMore,
  onLoadMore,
  showMobileSortModal,
  setShowMobileSortModal
}) {
  const [sortBy, setSortBy] = useState("relevance");

  const sortOptions = [
    { value: "relevance", label: "Most Popular" },
    { value: "price-low", label: "Price (Low to High)" },
    { value: "price-high", label: "Price (High to Low)" },
    { value: "rating", label: "Guest Rating (Highest First)" },
    { value: "star-rating", label: "Star Rating (Highest First)" },
    { value: "distance", label: "Distance from Beach" }
  ];

  const handleSortChange = (value) => {
    setSortBy(value);
    setShowMobileSortModal(false);
  };

  // Sorting the properties based on the selected sorting criteria
  const sortedProperties = sortProperties(properties, sortBy);

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
      {/* Desktop Sort Options */}
      <div className="hidden md:flex shadow-md p-4 rounded-3xl flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-md font-medium">Sort by:</span>
          <div className="flex flex-wrap gap-2">
            {sortOptions.slice(0, 4).map((option) => (
              <Button
                key={option.value}
                sx={{
                  backgroundColor: sortBy === option.value ? "#1035ac" : "transparent",
                  color: sortBy === option.value ? "white" : "inherit",
                  "&:hover": {
                    backgroundColor: sortBy === option.value ? "#1035ac" : "#f5f5f5",
                  },
                }}
                onClick={() => setSortBy(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Sorted by {sortOptions.find(opt => opt.value === sortBy)?.label}
        </div>
      </div>

      {/* Sort Modal for Mobile */}
      <Modal
        open={showMobileSortModal}
        onClose={() => setShowMobileSortModal(false)}
        BackdropProps={{
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
        }}
      >
        <Box sx={sortModalStyle}>
          <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              Sort Hotels
            </Typography>
            <Button
              onClick={() => setShowMobileSortModal(false)}
              sx={{
                position: 'absolute',
                right: 16,
                top: 16,
                minWidth: 'auto',
                color: '#666'
              }}
            >
              ✕
            </Button>
          </Box>
          
          <Box sx={{ p: 3 }}>
            <RadioGroup
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              {sortOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={
                    <Radio 
                      sx={{ 
                        color: '#1035ac',
                        '&.Mui-checked': {
                          color: '#1035ac',
                        }
                      }} 
                    />
                  }
                  label={option.label}
                  sx={{ 
                    mb: 1,
                    '& .MuiFormControlLabel-label': {
                      fontSize: '16px'
                    }
                  }}
                />
              ))}
            </RadioGroup>
          </Box>

          <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setShowMobileSortModal(false)}
              sx={{
                backgroundColor: '#1035ac',
                color: 'white',
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#0d2d8f'
                }
              }}
            >
              Apply Sorting
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Loading State */}
      {isLoading && properties.length === 0 && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      )}

      {/* Property Cards */}
      <div className="space-y-6 pb-24 lg:pb-0">
        {sortedProperties.map((property) => (
          <PropertyCard key={property._id} {...mapPropertyData(property)} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-8 pb-24 lg:pb-0">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            sx={{
              backgroundColor: '#1035ac',
              color: 'white',
              '&:hover': {
                backgroundColor: '#0d2d8f'
              }
            }}
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
    case "price-low":
      return [...properties].sort((a, b) => {
        const priceA = a.rooms?.[0]?.pricing?.baseAdultsCharge || 1000;
        const priceB = b.rooms?.[0]?.pricing?.baseAdultsCharge || 1000;
        return priceA - priceB;
      });

    case "price-high":
      return [...properties].sort((a, b) => {
        const priceA = a.rooms?.[0]?.pricing?.baseAdultsCharge || 1000;
        const priceB = b.rooms?.[0]?.pricing?.baseAdultsCharge || 1000;
        return priceB - priceA;
      });

    case "rating":
      return [...properties].sort(
        (a, b) => (b.placeRating || 4.5) - (a.placeRating || 4.5)
      );

    case "star-rating":
      return [...properties].sort(
        (a, b) => (b.starRating || 4) - (a.starRating || 4)
      );

    case "distance":
      return [...properties]; // Distance calculation can be implemented later

    default:
      return properties; // Default is relevance/most popular
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
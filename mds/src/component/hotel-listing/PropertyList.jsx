"use client";

import { useState } from "react";
import { PropertyCard } from "./PropertyCard";
import { Button, Modal, Box, Typography, Radio, RadioGroup, FormControlLabel } from "@mui/material";
import { TrendingUp, DollarSign, Star, MapPin } from "lucide-react";

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
    { value: "relevance", label: "Most Popular", icon: <TrendingUp className="w-4 h-4" /> },
    { value: "price-low", label: "Price (Low to High)", icon: <DollarSign className="w-4 h-4" /> },
    { value: "price-high", label: "Price (High to Low)", icon: <DollarSign className="w-4 h-4" /> },
    { value: "rating", label: "Guest Rating", icon: <Star className="w-4 h-4" /> },
    { value: "star-rating", label: "Star Rating", icon: <Star className="w-4 h-4" /> },
    { value: "distance", label: "Distance", icon: <MapPin className="w-4 h-4" /> }
  ];

  const handleSortChange = (value) => {
    setSortBy(value);
    setShowMobileSortModal(false);
  };

  const sortedProperties = sortProperties(properties, sortBy);

  if (error) {
    return (
      <div className="flex-1">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">❌</div>
          <p className="text-red-600 font-semibold text-lg">Error loading properties</p>
          <p className="text-red-500 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Desktop Sort Options */}
      <div className="hidden md:flex bg-white shadow-lg p-5 rounded-2xl flex-wrap items-center justify-between mb-8 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-linear-to-b from-blue-600 to-purple-600 rounded-full"></div>
          <span className="text-lg font-bold text-gray-800">Sort by:</span>
          <div className="flex flex-wrap gap-2">
            {sortOptions.slice(0, 4).map((option) => (
              <Button
                key={option.value}
                startIcon={option.icon}
                sx={{
                  background: sortBy === option.value 
                    ? 'linear-gradient(135deg, #1035ac 0%, #7c3aed 100%)'
                    : 'transparent',
                  color: sortBy === option.value ? 'white' : '#4b5563',
                  border: sortBy === option.value ? 'none' : '1px solid #e5e7eb',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  boxShadow: sortBy === option.value 
                    ? '0 4px 12px rgba(16, 53, 172, 0.3)'
                    : 'none',
                  '&:hover': {
                    background: sortBy === option.value 
                      ? 'linear-gradient(135deg, #0d2d8f 0%, #6d28d9 100%)'
                      : '#f9fafb',
                  },
                }}
                onClick={() => setSortBy(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Sort Modal for Mobile */}
      <Modal
        open={showMobileSortModal}
        onClose={() => setShowMobileSortModal(false)}
        BackdropProps={{
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.6)' }
        }}
      >
        <Box sx={sortModalStyle}>
          <Box sx={{ 
            p: 3, 
            borderBottom: '1px solid #e5e7eb',
            background: 'linear-gradient(135deg, #1035ac 0%, #7c3aed 100%)',
            borderRadius: '16px 16px 0 0'
          }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: 'white' }}>
              Sort Hotels
            </Typography>
            <Button
              onClick={() => setShowMobileSortModal(false)}
              sx={{
                position: 'absolute',
                right: 16,
                top: 16,
                minWidth: 'auto',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
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
                  label={
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{option.icon}</span>
                      <span className="font-medium">{option.label}</span>
                    </div>
                  }
                  sx={{ 
                    mb: 1.5,
                    p: 1.5,
                    borderRadius: '12px',
                    '&:hover': {
                      backgroundColor: '#f9fafb'
                    },
                    '& .MuiFormControlLabel-label': {
                      fontSize: '16px',
                      width: '100%'
                    }
                  }}
                />
              ))}
            </RadioGroup>
          </Box>

          <Box sx={{ p: 3, borderTop: '1px solid #e5e7eb' }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setShowMobileSortModal(false)}
              sx={{
                background: 'linear-gradient(135deg, #1035ac 0%, #7c3aed 100%)',
                color: 'white',
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(16, 53, 172, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0d2d8f 0%, #6d28d9 100%)',
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
        <div className="text-center py-16">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🏨</span>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium text-lg">Finding perfect stays for you...</p>
          <p className="mt-2 text-gray-400 text-sm">This will just take a moment</p>
        </div>
      )}

      {/* Property Cards */}
      <div className="space-y-6 pb-24 lg:pb-0">
        {sortedProperties.map((property, index) => (
          <div
            key={property._id}
            className="animate-fadeIn"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <PropertyCard {...mapPropertyData(property)} />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && !isLoading && (
        <div className="text-center mt-10 pb-24 lg:pb-0">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            sx={{
              background: 'linear-gradient(135deg, #1035ac 0%, #7c3aed 100%)',
              color: 'white',
              px: 6,
              py: 2,
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(16, 53, 172, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0d2d8f 0%, #6d28d9 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(16, 53, 172, 0.4)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            Load More Properties
          </Button>
        </div>
      )}

      {/* No Properties Message */}
      {!isLoading && properties.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="text-7xl mb-6">🔍</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No Properties Found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            We couldn't find any properties matching your search criteria. Try adjusting your filters or search parameters.
          </p>
          <Button
            sx={{
              background: 'linear-gradient(135deg, #1035ac 0%, #7c3aed 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #0d2d8f 0%, #6d28d9 100%)',
              }
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper function to sort properties
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
      return [...properties];

    default:
      return properties;
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
  return amenityList.slice(0, 6);
}
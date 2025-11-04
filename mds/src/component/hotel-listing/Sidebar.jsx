"use client"

import { useCallback, useEffect, useState } from "react"
import { X, SlidersHorizontal, Filter } from "lucide-react"
import { 
  Button, 
  Checkbox, 
  Modal, 
  Box, 
  Typography, 
  FormControlLabel,
  Chip,
  Divider,
  CircularProgress
} from "@mui/material"
import { debounce } from 'lodash';

import { useDispatch, useSelector } from 'react-redux';
import { applyFilters, clearFilters } from "@/redux/features/property/propertySlice"

const filterModalStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  bgcolor: 'background.paper',
  borderRadius: '16px 16px 0 0',
  boxShadow: 24,
  p: 0,
  maxHeight: '85vh',
  overflow: 'auto',
  '@media (min-width: 768px)': {
    left: '50%',
    right: 'auto',
    bottom: '50%',
    transform: 'translate(-50%, 50%)',
    borderRadius: '16px',
    maxWidth: '500px',
    width: '90%',
  }
};

export function Sidebar({ isMobile = false, showModal = false, onCloseModal = () => {} }) {
  const dispatch = useDispatch();
  const { 
    appliedFilters, 
    searchQuery, 
    filterStats,
    isSearchLoading 
  } = useSelector(state => state.property);
  
  const [localFilters, setLocalFilters] = useState(appliedFilters);

  const debouncedApplyFilters = useCallback(
  debounce((filters) => {
    dispatch(applyFilters({
      searchParams: searchQuery,
      filters: filters
    }));
  }, 500), // 500ms delay
  [dispatch, searchQuery]
);



  // Sync local filters with Redux when appliedFilters change
  useEffect(() => {
    setLocalFilters(appliedFilters);
  }, [appliedFilters]);
  
  // 🔥 Real-time filter application - triggers on every change
const handleFilterChange = (category, value) => {
  const updatedFilters = { ...localFilters };
  const currentValues = updatedFilters[category] || [];
  
  const newValues = currentValues.includes(value)
    ? currentValues.filter(v => v !== value)
    : [...currentValues, value];
  
  updatedFilters[category] = newValues;
  setLocalFilters(updatedFilters);
  
  // 🔥 Debounced API call
  debouncedApplyFilters(updatedFilters);
};

  const clearAllFilters = () => {
    const emptyFilters = {
      priceRange: [],
      starRating: [],
      distance: [],
      amenities: [],
      propertyType: []
    };
    
    setLocalFilters(emptyFilters);
    dispatch(clearFilters());
    dispatch(applyFilters({
      searchParams: searchQuery,
      filters: emptyFilters
    }));
  };

  const getActiveFiltersCount = () => {
    return Object.values(localFilters).flat().length;
  };

  const getFilterCount = (category, value) => {
    if (!filterStats) return null;
    
    switch (category) {
      case 'priceRange':
        return filterStats.priceRanges?.[value] || 0;
      case 'starRating':
        const rating = value.match(/(\d+)/)?.[1];
        return filterStats.starRatings?.find(r => r._id === rating)?.count || 0;
      case 'distance':
        return filterStats.distanceRanges?.[value] || 0;
      default:
        return null;
    }
  };

  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Active Filters Count */}
      {getActiveFiltersCount() > 0 && (
        <div className="bg-linear-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-800">Active Filters</span>
              <Chip 
                label={getActiveFiltersCount()} 
                size="small"
                sx={{ 
                  backgroundColor: '#1035ac', 
                  color: 'white',
                  fontWeight: 600,
                  height: '24px'
                }}
              />
            </div>
            <Button
              onClick={clearAllFilters}
              disabled={isSearchLoading}
              sx={{
                color: '#1035ac',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '14px',
                p: 0,
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline'
                },
                '&:disabled': {
                  opacity: 0.5
                }
              }}
            >
              Clear All
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {Object.entries(localFilters).map(([category, values]) =>
              values.map((value, index) => (
                <Chip
                  key={`${category}-${index}`}
                  label={value}
                  onDelete={() => handleFilterChange(category, value)}
                  deleteIcon={<X className="w-3 h-3" />}
                  disabled={isSearchLoading}
                  sx={{
                    backgroundColor: 'white',
                    border: '1px solid #1035ac',
                    color: '#1035ac',
                    fontWeight: 500,
                    '& .MuiChip-deleteIcon': {
                      color: '#1035ac',
                      '&:hover': {
                        color: '#0d2d8f'
                      }
                    },
                    '&.Mui-disabled': {
                      opacity: 0.6
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isSearchLoading && (
        <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 rounded-lg">
          <CircularProgress size={20} sx={{ color: '#1035ac' }} />
          <span className="text-sm font-medium text-blue-900">Applying filters...</span>
        </div>
      )}

      {/* Price Range */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-linear-to-b from-blue-600 to-purple-600 rounded-full"></div>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
            Price Range
          </Typography>
        </div>
        <div className="space-y-2">
          {["Under ₹10000", "₹10000 - ₹20000", "₹20000 - ₹30000", "Above ₹30000"].map((range) => (
            <FormControlLabel 
              key={range}
              control={
                <Checkbox 
                  checked={localFilters.priceRange?.includes(range) || false}
                  onChange={() => handleFilterChange('priceRange', range)}
                  disabled={isSearchLoading}
                  sx={{
                    color: '#1035ac',
                    '&.Mui-checked': {
                      color: '#1035ac',
                    }
                  }}
                />
              } 
              label={range}
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#4b5563'
                }
              }}
            />
          ))}
        </div>
      </div>

      <Divider />

      {/* Star Rating */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-linear-to-b from-blue-600 to-purple-600 rounded-full"></div>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
            Star Rating
          </Typography>
        </div>
        <div className="space-y-2">
          {["5 Star", "4 Star", "3 Star"].map((rating) => (
            <FormControlLabel 
              key={rating}
              control={
                <Checkbox 
                  checked={localFilters.starRating?.includes(rating) || false}
                  onChange={() => handleFilterChange('starRating', rating)}
                  disabled={isSearchLoading}
                  sx={{
                    color: '#1035ac',
                    '&.Mui-checked': {
                      color: '#1035ac',
                    }
                  }}
                />
              } 
              label={
                <div className="flex items-center gap-1">
                  <span>{rating}</span>
                  <span className="text-yellow-500">★</span>
                </div>
              }
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#4b5563'
                }
              }}
            />
          ))}
        </div>
      </div>

      <Divider />

      {/* Distance from Temple */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-linear-to-b from-blue-600 to-purple-600 rounded-full"></div>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
            Distance from Temple
          </Typography>
        </div>
        <div className="space-y-2">
          {[
            { label: "Within 500m", count: getFilterCount('distance', 'Within 500m') },
            { label: "500m - 1km", count: getFilterCount('distance', '500m - 1km') },
            { label: "1km - 2km", count: getFilterCount('distance', '1km - 2km') }
          ].map((option) => (
            <FormControlLabel 
              key={option.label}
              control={
                <Checkbox 
                  checked={localFilters.distance?.includes(option.label) || false}
                  onChange={() => handleFilterChange('distance', option.label)}
                  disabled={isSearchLoading}
                  sx={{
                    color: '#1035ac',
                    '&.Mui-checked': {
                      color: '#1035ac',
                    }
                  }}
                />
              } 
              label={
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  {option.count !== null && (
                    <Chip 
                      label={option.count} 
                      size="small"
                      sx={{
                        height: '20px',
                        fontSize: '12px',
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280'
                      }}
                    />
                  )}
                </div>
              }
              sx={{
                width: '100%',
                '& .MuiFormControlLabel-label': {
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#4b5563',
                  width: '100%'
                }
              }}
            />
          ))}
        </div>
      </div>

      <Divider />

      {/* Amenities */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-linear-to-b from-blue-600 to-purple-600 rounded-full"></div>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
            Amenities
          </Typography>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            "WiFi", "AC", "Parking", "Hot Water", 
            "Meals", "Pool", "Lift", "Security",
            "Prayer Room", "Beach Access"
          ].map((amenity) => (
            <FormControlLabel 
              key={amenity}
              control={
                <Checkbox 
                  checked={localFilters.amenities?.includes(amenity) || false}
                  onChange={() => handleFilterChange('amenities', amenity)}
                  disabled={isSearchLoading}
                  sx={{
                    color: '#1035ac',
                    '&.Mui-checked': {
                      color: '#1035ac',
                    }
                  }}
                />
              } 
              label={amenity}
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#4b5563'
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Modal
        open={showModal}
        onClose={onCloseModal}
        BackdropProps={{
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.6)' }
        }}
      >
        <Box sx={filterModalStyle}>
          {/* Header */}
          <Box sx={{ 
            p: 3, 
            borderBottom: '1px solid #e5e7eb', 
            background: 'linear-gradient(135deg, #1035ac 0%, #7c3aed 100%)',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderRadius: '16px 16px 0 0'
          }}>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-6 h-6 text-white" />
              <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: 'white' }}>
                Filter Hotels
              </Typography>
            </div>
            <Button
              onClick={onCloseModal}
              sx={{
                minWidth: 'auto',
                color: 'white',
                p: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <X className="w-6 h-6" />
            </Button>
          </Box>
          
          {/* Content */}
          <Box sx={{ p: 3, pb: 1 }}>
            <SidebarContent />
          </Box>

          {/* Footer */}
          <Box sx={{ 
            p: 3, 
            borderTop: '1px solid #e5e7eb', 
            bgcolor: 'white', 
            position: 'sticky', 
            bottom: 0,
            boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <div className="flex gap-3">
              <Button
                variant="outlined"
                onClick={clearAllFilters}
                disabled={isSearchLoading}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderColor: '#1035ac',
                  color: '#1035ac',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '15px',
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px',
                    borderColor: '#0d2d8f',
                    backgroundColor: '#f0f4ff'
                  },
                  '&:disabled': {
                    opacity: 0.5
                  }
                }}
              >
                Clear All
              </Button>
              <Button
                variant="contained"
                onClick={onCloseModal}
                disabled={isSearchLoading}
                sx={{
                  flex: 2,
                  background: 'linear-gradient(135deg, #1035ac 0%, #7c3aed 100%)',
                  color: 'white',
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '15px',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(16, 53, 172, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0d2d8f 0%, #6d28d9 100%)',
                  },
                  '&:disabled': {
                    opacity: 0.5
                  }
                }}
              >
                {isSearchLoading ? 'Filtering...' : `Close`}
              </Button>
            </div>
          </Box>
        </Box>
      </Modal>
    );
  }

  return (
    <div className="w-full lg:w-80 bg-white p-6 rounded-2xl shadow-lg border border-gray-200 h-fit sticky top-24">
      {/* Filters Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold bg-linear-to-b from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Filters
          </h3>
        </div>
        {getActiveFiltersCount() > 0 && (
          <Button 
            onClick={clearAllFilters}
            disabled={isSearchLoading}
            sx={{ 
              color: '#1035ac', 
              p: 0,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '14px',
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline'
              },
              '&:disabled': {
                opacity: 0.5
              }
            }}
          >
            Clear All
          </Button>
        )}
      </div>

      <SidebarContent />
    </div>
  );
}
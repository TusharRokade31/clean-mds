"use client"

import { useState } from "react"
import { X, Tune } from "lucide-react"
import { 
  Button, 
  Checkbox, 
  Slider, 
  Modal, 
  Box, 
  Typography, 
  FormControlLabel,
  FormGroup
} from "@mui/material"

const filterModalStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  bgcolor: 'background.paper',
  borderRadius: '16px 16px 0 0',
  boxShadow: 24,
  p: 0,
  maxHeight: '80vh',
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
  const [priceRange, setPriceRange] = useState([10000])
  const [activeFilters, setActiveFilters] = useState(["Near Temple", "WiFi"])

  const removeFilter = (filter) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter))
  }

  const SidebarContent = () => (
    <>
      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeFilters.map((filter) => (
            <div
              key={filter}
              className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              {filter}
              <button onClick={() => removeFilter(filter)} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Price Range */}
      <div className="mb-8">
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Price Range (per night)
        </Typography>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <FormControlLabel control={<Checkbox />} label="Under ₹10,000" />
            <FormControlLabel control={<Checkbox />} label="₹10,000 - ₹20,000" />
            <FormControlLabel control={<Checkbox />} label="₹20,000 - ₹30,000" />
            <FormControlLabel control={<Checkbox />} label="Above ₹30,000" />
          </div>
        </div>
      </div>

      {/* Star Rating */}
      <div className="mb-8">
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Star Rating
        </Typography>
        <div className="space-y-3">
          <FormControlLabel control={<Checkbox />} label="5 Star" />
          <FormControlLabel control={<Checkbox />} label="4 Star" />
          <FormControlLabel control={<Checkbox />} label="3 Star" />
        </div>
      </div>

      {/* Distance from Temple */}
      <div className="mb-8">
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Distance from Temple
        </Typography>
        <div className="space-y-3">
          <FormControlLabel 
            control={<Checkbox defaultChecked />} 
            label="Within 500m (12)" 
          />
          <FormControlLabel 
            control={<Checkbox />} 
            label="500m - 1km (8)" 
          />
          <FormControlLabel 
            control={<Checkbox />} 
            label="1km - 2km (4)" 
          />
        </div>
      </div>

      {/* Amenities */}
      <div>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Amenities
        </Typography>
        <div className="space-y-3">
          <FormControlLabel control={<Checkbox />} label="Beach Access" />
          <FormControlLabel control={<Checkbox />} label="Swimming Pool" />
          <FormControlLabel control={<Checkbox defaultChecked />} label="WiFi" />
          <FormControlLabel control={<Checkbox />} label="AC" />
          <FormControlLabel control={<Checkbox />} label="Meals" />
          <FormControlLabel control={<Checkbox />} label="Parking" />
          <FormControlLabel control={<Checkbox />} label="Lift" />
          <FormControlLabel control={<Checkbox />} label="Hot Water" />
          <FormControlLabel control={<Checkbox />} label="Prayer Room" />
          <FormControlLabel control={<Checkbox />} label="Security" />
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Modal
        open={showModal}
        onClose={onCloseModal}
        BackdropProps={{
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
        }}
      >
        <Box sx={filterModalStyle}>
          <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              Filter Hotels
            </Typography>
            <Button
              onClick={onCloseModal}
              sx={{
                minWidth: 'auto',
                color: '#666',
                p: 0.5
              }}
            >
              <X className="w-5 h-5" />
            </Button>
          </Box>
          
          <Box sx={{ p: 3, pb: 1 }}>
            <SidebarContent />
          </Box>

          <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0', bgcolor: 'white', position: 'sticky', bottom: 0 }}>
            <div className="flex gap-3">
              <Button
                variant="outlined"
                onClick={() => {
                  setActiveFilters([]);
                  setPriceRange([10000]);
                }}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderColor: '#1035ac',
                  color: '#1035ac',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Clear All
              </Button>
              <Button
                variant="contained"
                onClick={onCloseModal}
                sx={{
                  flex: 2,
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
                Show Results
              </Button>
            </div>
          </Box>
        </Box>
      </Modal>
    );
  }

  return (
    <div className="w-full lg:w-80 bg-white p-6 rounded-lg shadow-md h-fit">
      {/* Filters Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button 
          onClick={() => {
            setActiveFilters([]);
            setPriceRange([10000]);
          }}
          sx={{ 
            color: '#1035ac', 
            p: 0,
            textTransform: 'none'
          }}
        >
          Clear All
        </Button>
      </div>

      <SidebarContent />
    </div>
  );
}
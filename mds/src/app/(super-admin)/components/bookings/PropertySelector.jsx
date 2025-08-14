import React from 'react';
import { 
  Card, 
  CardContent, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box, 
  Typography,
  Chip 
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const PropertySelector = ({ properties, selectedProperty, onPropertyChange, isAdmin }) => {
  return (
    <Card sx={{ mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <HomeIcon sx={{ color: 'primary.main' }} />
          <FormControl size="small" sx={{ minWidth: 300 }}>
            <InputLabel>Select Property</InputLabel>
            <Select
              value={selectedProperty?._id || ''}
              label="Select Property"
              onChange={(e) => {
                const property = properties.find(p => p._id === e.target.value);
                onPropertyChange(property);
              }}
            >
              <MenuItem value="">
                <Typography color="text.secondary">Choose a property</Typography>
              </MenuItem>
              {properties.map((property) => (
                <MenuItem key={property._id} value={property._id}>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {property.placeName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {property.propertyType} • {property.location.city}, {property.location.state}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {selectedProperty && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <Chip 
                label={selectedProperty.status || 'Active'} 
                color="success" 
                size="small" 
              />
              <Typography variant="body2" color="text.secondary">
                {selectedProperty.rooms?.length || 0} rooms
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PropertySelector;
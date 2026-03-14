'use client'
import { 
  FormControlLabel, Radio, RadioGroup, TextField, Button, 
  Grid, Typography, FormGroup, Checkbox, FormControl, FormLabel,
  Tabs, Tab, Box, Chip, Select, MenuItem, InputLabel,
  Alert, useMediaQuery, useTheme
} from '@mui/material';
import { useState } from 'react';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function AmenitiesForm({ formData, amenityCategories, onChange, errors, onSave, mandatoryErrors }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getAmenityValue = (category, amenityName) => {
    const key = amenityName.replace(/[^a-zA-Z0-9]/g, '');
    return formData?.[category]?.[key] || { 
      available: undefined,
      option: [],
      subOptions: []
    };
  };

  const handleAmenityChange = (category, amenityName, updates) => {
    const key = amenityName.replace(/[^a-zA-Z0-9]/g, '');
    const updatedAmenities = {
      ...formData,
      [category]: {
        ...formData[category],
        [key]: updates
      }
    };
    onChange(updatedAmenities);
  };

  const getSelectedCount = (category) => {
    const categoryData = formData?.[category];
    if (!categoryData) return 0;
    return Object.values(categoryData).filter(amenity => 
      amenity.available !== undefined && amenity.available !== null
    ).length;
  };

  // Shared MUI outlined input styles
  const outlinedInputSx = {
    "& .MuiOutlinedInput-root": {
      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#2e2e2e" },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1976d2" },
      "& .MuiInputLabel-outlined": {
        color: "#2e2e2e",
        "&.Mui-focused": { color: "secondary.main" },
      },
    },
  };

  const renderAmenityOptions = (category, amenity) => {
    const amenityValue = getAmenityValue(category, amenity.name);
    const hasOptions = amenity.options && amenity.options.length > 0;
    const hasSuboptions = amenity.Suboptions && amenity.Suboptions.length > 0;
    const isMandatory = category === 'mandatory';
    const isUnselected = isMandatory && (amenityValue.available === undefined || amenityValue.available === null);

    return (
      <Grid
        container
        sx={{
          mb: 3,
          pb: 3,
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: isUnselected ? 'rgba(244, 67, 54, 0.05)' : 'transparent',
          borderRadius: isUnselected ? 1 : 0,
          // p: isUnselected ? { xs: 1.5, sm: 2 } : 0,
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        {/* Amenity Name and Yes/No Radio */}
        <Grid item xs={12}>
          <FormControl sx={{ ...outlinedInputSx, display: "flex", alignItems: "start" }} component="fieldset">
            <FormLabel
              component="legend"
              sx={{
                fontWeight: 'bold',
                mb: 1,
                color: isUnselected ? 'error.main' : 'inherit',
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              {amenity.name}
              {isMandatory && (
                <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
              )}
              {isUnselected && (
                <Typography variant="caption" color="error" display="block">
                  Please select Yes or No
                </Typography>
              )}
            </FormLabel>
            <RadioGroup
              value={amenityValue.available === undefined ? '' : (amenityValue.available ? 'yes' : 'no')}
              onChange={(e) => {
                const isAvailable = e.target.value === 'yes';
                handleAmenityChange(category, amenity.name, {
                  available: isAvailable,
                  option: isAvailable ? amenityValue.option : [],
                  subOptions: isAvailable ? amenityValue.subOptions : []
                });
              }}
              row
            >
              <FormControlLabel value="no" control={<Radio size={isMobile ? 'small' : 'medium'} />} label="No" />
              <FormControlLabel value="yes" control={<Radio size={isMobile ? 'small' : 'medium'} />} label="Yes" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Options Dropdown */}
        {amenityValue.available && hasOptions && (
          <Grid item xs={12} sm={6} md={4}>
            <FormControl sx={{ ...outlinedInputSx, minWidth: 150 }} fullWidth>
              <InputLabel>Select Options</InputLabel>
              <Select
              fullWidth
                multiple
                value={amenityValue.option || []}
                label="Select Options"
                onChange={(e) => {
                  const value = typeof e.target.value === 'string'
                    ? e.target.value.split(',')
                    : e.target.value;
                  handleAmenityChange(category, amenity.name, { ...amenityValue, option: value });
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {amenity.options.map((option, index) => (
                  <MenuItem
                    key={index}
                    value={option}
                    sx={{
                      backgroundColor: amenityValue.option?.includes(option)
                        ? 'rgba(25, 118, 210, 0.08)'
                        : 'transparent'
                    }}
                  >
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Suboptions Dropdown */}
       {amenityValue.available && hasSuboptions && 
         (!hasOptions || (hasOptions && amenityValue.option?.length > 0)) && (
          <Grid sx={{marginInlineStart:'15px'}}  item size={{xs:12, md:3}}>
            <FormControl sx={{
              "& .MuiOutlinedInput-root": {

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2e2e2e",
                },
                "&.Mui-focused": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                },
                "& .MuiInputLabel-outlined": {
                  color: "#2e2e2e",
                  "&.Mui-focused": {
                    color: "secondary.main",

                  },
                },
              },
            }}  fullWidth>
              <InputLabel>Select Additional Options</InputLabel>
              <Select
  multiple={amenity.name !== 'Fireplace'}
  value={amenityValue.subOptions || []}
  label="Select Additional Options"
  onChange={(e) => {
    // Get the current array of values
    let value = typeof e.target.value === 'string' 
      ? e.target.value.split(',') 
      : e.target.value;

    // --- MUTUAL EXCLUSION LOGIC ---
    // Identify the item the user just clicked
    const lastSelected = value[value.length - 1];

    if (lastSelected === 'Free') {
      // If "Free" was just selected, filter out "Paid"
      value = value.filter(val => val !== 'Paid');
    } else if (lastSelected === 'Paid') {
      // If "Paid" was just selected, filter out "Free"
      value = value.filter(val => val !== 'Free');
    }
    // ------------------------------

    handleAmenityChange(category, amenity.name, {
      ...amenityValue,
      subOptions: value
    });
  }}
  renderValue={(selected) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {selected.map((value) => (
        <Chip key={value} label={value} size="small" />
      ))}
    </Box>
  )}
>
  {amenity.Suboptions.map((suboption, index) => (
    <MenuItem 
      key={index} 
      value={suboption}
      sx={{
        backgroundColor: amenityValue.subOptions?.includes(suboption) 
          ? 'rgba(156, 39, 176, 0.08)' 
          : 'transparent'
      }}
    >
      <Checkbox 
        checked={amenityValue.subOptions?.includes(suboption) || false}
        sx={{ mr: 1 }}
      />
      {suboption}
    </MenuItem>
  ))}
</Select>
            </FormControl>
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 3 } }}>
      <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom>
        All Amenities
      </Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        Answering the amenities available at your property can significantly influence guests to book! Please answer the <strong>Mandatory Amenities</strong> available below
      </Typography>

      {errors?.mandatoryAmenities && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.mandatoryAmenities}
        </Alert>
      )}

      <Box
        sx={{
          flexGrow: 1,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          // Fixed height on desktop, auto on mobile so content isn't clipped
          height: { xs: 'auto', sm: '600px', md: '650px' },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        {/* Tabs — horizontal on mobile, vertical on sm+ */}
        <Tabs
          orientation={isMobile ? 'horizontal' : 'vertical'}
          variant="scrollable"
          scrollButtons={isMobile ? 'auto' : false}
          value={selectedTab}
          onChange={handleTabChange}
          aria-label="Amenity categories"
          sx={{
            borderRight: { xs: 0, sm: 1 },
            borderBottom: { xs: 1, sm: 0 },
            borderColor: 'divider',
            minWidth: { sm: '200px', md: '250px' },
            maxWidth: { xs: '100%', sm: '250px' },
            bgcolor: { xs: 'grey.50', sm: 'background.paper' },
            '& .MuiTab-root': {
              alignItems: { xs: 'center', sm: 'flex-start' },
              textAlign: { xs: 'center', sm: 'left' },
              minHeight: { xs: '48px', sm: '60px' },
              padding: { xs: '8px 12px', sm: '12px 16px' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            },
          }}
        >
          {Object.entries(amenityCategories).map(([category, { title }], index) => {
            const selectedCount = getSelectedCount(category);
            const totalCount = amenityCategories[category].items.length;
            const isComplete = category === 'mandatory' ? selectedCount === totalCount : true;

            return (
              <Tab
                key={category}
                label={
                  <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, lineHeight: 1.3 }}>
                      {title} ({selectedCount}{category === 'mandatory' ? `/${totalCount}` : ''})
                    </Typography>
                    {category === 'mandatory' && !isComplete && (
                      <Typography variant="caption" color="error" display="block">
                        Required
                      </Typography>
                    )}
                  </Box>
                }
                id={`vertical-tab-${index}`}
                aria-controls={`vertical-tabpanel-${index}`}
              />
            );
          })}
        </Tabs>

        {/* Tab Panels */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {Object.entries(amenityCategories).map(([category, { title, items }], index) => (
            <TabPanel key={category} value={selectedTab} index={index}>
              <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom sx={{ fontWeight: 600 }}>
                {title}
                {category === 'mandatory' && (
                  <Chip label="All Required" color="error" size="small" sx={{ ml: 1 }} />
                )}
              </Typography>

              <FormGroup>
                {items.map((amenity, amenityIndex) => (
                  <div key={amenityIndex}>
                    {renderAmenityOptions(category, amenity)}
                  </div>
                ))}
              </FormGroup>
            </TabPanel>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
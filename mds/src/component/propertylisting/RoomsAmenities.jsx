'use client'
import { useState, useEffect, useRef } from 'react';
import {
    Button, Typography, Divider, TextField, FormControl,
    InputLabel, Select, MenuItem, FormHelperText, Grid,
    Paper, IconButton, Chip, Box, Checkbox, FormControlLabel,
    Card, CardContent, Tabs, Tab, RadioGroup, Radio, FormLabel,

} from '@mui/material';




// Tab Panel Component for Room Amenities
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`room-tabpanel-${index}`}
      aria-labelledby={`room-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const RoomsAmenities = ({roomAmenityCategories, currentRoomData, handleRoomAmenityChange, selectedAmenityTab, setSelectedAmenityTab }) => {





      // Count selected amenities for each category
const getRoomSelectedCount = (category) => {
    const categoryData = currentRoomData?.amenities?.[category];
    if (!categoryData) return 0;

    // Only count as "selected" if the user explicitly chose 'Yes'
    return Object.values(categoryData).filter(amenity => 
        amenity && amenity.available === true
    ).length;
};


    // Handle room amenity changes
    const getRoomAmenityValue = (category, amenityName) => {
        const key = amenityName.replace(/[^a-zA-Z0-9]/g, '');
        return currentRoomData?.amenities?.[category]?.[key] || {
            available: undefined,
            option: [],
            subOptions: []
        };
    };


    const renderRoomAmenityOptions = (category, amenity) => {
        const amenityValue = getRoomAmenityValue(category, amenity.name);
        const hasOptions = amenity.options && amenity.options.length > 0;
        const hasSuboptions = amenity.Suboptions && amenity.Suboptions.length > 0;

        return (
            <Grid container spacing={2} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Grid item xs={12}>
                    <FormControl
                        sx={{
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
                        }}
                        component="fieldset">
                        <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {amenity.name}
                        </FormLabel>
                        <RadioGroup
                            // value={amenityValue.available ? 'yes' : 'no'}
                            value={amenityValue.available === undefined ? '' : (amenityValue.available ? 'yes' : 'no')}
                            onChange={(e) => {
                                const isAvailable = e.target.value === 'yes';
                                handleRoomAmenityChange(category, amenity.name, {
                                    available: isAvailable,
                                    option: isAvailable ? amenityValue.option : [],
                                    subOptions: isAvailable ? amenityValue.subOptions : []
                                });
                            }}
                            row
                        >
                            <FormControlLabel value="no" control={<Radio />} label="No" />
                            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                        </RadioGroup>
                    </FormControl>
                </Grid>

                {amenityValue.available && hasOptions && (
                    <Grid item size={{ xs: 12, md: 2 }}>
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
                        }} fullWidth>
                            <InputLabel>Select Options</InputLabel>
                            <Select
                                // multiple
                                value={amenityValue.option || []}
                                label="Select Options"
                                onChange={(e) => {
                                    const value = typeof e.target.value === 'string'
                                        ? e.target.value.split(',')
                                        : e.target.value;

                                    handleRoomAmenityChange(category, amenity.name, {
                                        ...amenityValue,
                                        option: value
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
                                {amenity.options.map((option, index) => (
                                    <MenuItem key={index} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                )}

                {amenityValue.available && hasSuboptions &&
                    (!hasOptions || (hasOptions && amenityValue.option?.length > 0)) && (
                        <Grid item size={{ xs: 12, md: 2 }}>
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
                            }} fullWidth>
                                <InputLabel>Additional Options</InputLabel>
                                <Select
                                    multiple
                                    value={amenityValue.subOptions || []}
                                    label="Additional Options"
                                    onChange={(e) => {
                                        const value = typeof e.target.value === 'string'
                                            ? e.target.value.split(',')
                                            : e.target.value;

                                        handleRoomAmenityChange(category, amenity.name, {
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
        <Grid item xs={12}>
            <Divider className="my-3" />
            <Typography sx={{ marginTop: "10px" }} variant="subtitle1" gutterBottom>Room Amenities</Typography>

            <Box sx={{ marginTop: "10px", width: '100%', bgcolor: 'background.paper' }}>
                {/* Amenity Category Tabs */}
                <Tabs
                    value={selectedAmenityTab}
                    onChange={(event, newValue) => setSelectedAmenityTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="Room amenity categories"
                    sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                >
                    {Object.entries(roomAmenityCategories).map(([category, { title }], index) => {
                        const selectedCount = getRoomSelectedCount(category);
                        return (
                            <Tab
                                key={category}
                                label={`${title} (${selectedCount})`}
                                id={`room-tab-${index}`}
                                aria-controls={`room-tabpanel-${index}`}
                            />
                        );
                    })}
                </Tabs>

                {/* Amenity Tab Panels */}
                {Object.entries(roomAmenityCategories).map(([category, { title, items }], index) => (
                    <TabPanel key={category} value={selectedAmenityTab} index={index}>
                        <Typography variant="h6" gutterBottom>{title}</Typography>
                        <div>
                            {items.map((amenity, amenityIndex) => (
                                <div key={amenityIndex}>
                                    {renderRoomAmenityOptions(category, amenity)}
                                </div>
                            ))}
                        </div>
                    </TabPanel>
                ))}
            </Box>
        </Grid>
    )
}

export default RoomsAmenities
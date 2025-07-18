// components/property-overview.tsx
"use client"

import { 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Chip,
  Button,
  Card,
  CardContent,
  Tab,
  Tabs,
  ImageList,
  ImageListItem,
  Dialog,
  DialogContent,
  IconButton
} from "@mui/material"
import { 
  Star, 
  CalendarToday, 
  Home, 
  Email, 
  Phone,
  Verified,
  Close,
  ChevronLeft,
  ChevronRight
} from "@mui/icons-material"
import { useState } from "react"
import AmenitiesSection from "./amenities-section"

export default function PropertyOverview({ data, setActiveSection }) {
  const [selectedTab, setSelectedTab] = useState(0)
  const [openGallery, setOpenGallery] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  // Add null checks for data and media
  if (!data) {
    return <Typography>Loading...</Typography>
  }

  // Get unique image categories
  const getImageCategories = () => {
    if (!data.media?.images || !Array.isArray(data.media.images)) return ['All']
    
    const categories = [...new Set(data.media.images.flatMap(img => img.tags || []))]
    return ['All', ...categories]
  }

  // Fixed: Filter images by category
const getFilteredImages = () => {
  if (!data.media?.images || !Array.isArray(data.media.images)) return []
  
  const categories = getImageCategories()
  const selectedCategory = categories[selectedTab]
  
  if (selectedCategory === 'All') {
    // Create a proper copy of the array before sorting
    return [...data.media.images].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  }
  
  // Filter first, then sort the filtered results
  return data.media.images
    .filter(img => img.tags && img.tags.includes(selectedCategory))
    .slice() // Create a copy of the filtered array
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
}

  // Get cover image and first few images for main display
  const getCoverImage = () => {
    if (!data.media?.images || !Array.isArray(data.media.images) || data.media.images.length === 0) return null
    return data.media.images.find(img => img.isCover) || data.media.images[0]
  }

  const getDisplayImages = () => {
    if (!data.media?.images || !Array.isArray(data.media.images)) return []
    const sorted = [...data.media.images].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    return sorted.slice(0, 3)
  }

  const handleImageClick = (index) => {
    setSelectedImage(index)
    setOpenGallery(true)
  }


  const coverImage = getCoverImage()
  const displayImages = getDisplayImages()
  const imageCategories = getImageCategories()
  const filteredImages = getFilteredImages()

  return (
      <Box sx={{ space: 3 }}>
    {/* Property Images and Booking Section */}
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {/* Images Section */}
      <Grid item size={{xs:12,lg:8}}>
        <Paper sx={{ p: 0 }}>
          <Grid container spacing={1}>
            {/* Main Image */}
            <Grid item size={{xs:12, md:8}}>
              <Box
                sx={{
                  aspectRatio: "16/9",
                  bgcolor: "grey.200",
                  borderRadius: 1,
                  overflow: "hidden",
                  cursor: "pointer",
                  position: "relative"
                }}
                onClick={() => handleImageClick(0)}
              >
                {coverImage ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${coverImage.url}`}
                    alt="Property main image"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Typography color="text.secondary">Main Property Image</Typography>
                  </Box>
                )}
                {data.media?.images && data.media.images.length > 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 16,
                      left: 16,
                      bgcolor: "rgba(0,0,0,0.7)",
                      color: "white",
                      px: 2,
                      py: 1,
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="body2">
                      +{data.media.images.length} Property Photos
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
            
            {/* Thumbnail Images Grid */}
            <Grid item size={{xs:12, md:4}}>
              <Grid container spacing={1} sx={{ height: "100%" }}>
                {displayImages.slice(1, 5).map((image, index) => (
                  <Grid item size={{xs:6, md:12}} key={image._id || index}>
                    <Box
                      sx={{
                        aspectRatio: "1/1",
                        bgcolor: "grey.200",
                        borderRadius: 1,
                        overflow: "hidden",
                        cursor: "pointer",
                        position: "relative"
                      }}
                      onClick={() => handleImageClick(index + 1)}
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${image.url}`}
                        alt={`Property image ${index + 2}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                      />
                      {index === 3 && data.media?.images && data.media.images.length > 5 && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: "rgba(0,0,0,0.5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white"
                          }}
                        >
                          <Typography variant="h6">
                            +{data.media.images.length - 5} More
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Booking Card - Moved beside images */}
      <Grid item size={{xs:12,lg:4}}>
        <Paper
          sx={{
            p: 3,
            position: "sticky",
            top: "100px",
            height: "fit-content"
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              {data.rooms?.[0]?.roomType || "Book Now"}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Star sx={{ color: "gold", fontSize: 20 }} />
              <Typography>{data.placeRating || "N/A"}</Typography>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary" mb={1}>
            Fits {data.rooms?.[0]?.occupancy?.maximumAdults || 2} Adults
          </Typography>

          <Box mb={2}>
            <Chip label="No meals included" size="small" sx={{ mr: 1, mb: 1 }} />
            <Chip label="Non-Refundable" size="small" />
          </Box>
          
          <Box textAlign="left" mb={2}>
            <Typography variant="body2" color="text.secondary">
              Per night for {data.rooms?.[0]?.occupancy?.maximumAdults || 2} Rooms:
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              ₹{data.rooms?.[0]?.pricing?.baseAdultsCharge || "N/A"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              + ₹{data.rooms?.[0]?.pricing?.taxes || 0} taxes & fees
            </Typography>
          </Box>

          <Box sx={{ space: 1, mb: 2 }}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Max Adults:</Typography>
              <Typography variant="body2" fontWeight="medium">
                {data.rooms?.[0]?.occupancy?.maximumAdults || "N/A"}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Max Children:</Typography>
              <Typography variant="body2" fontWeight="medium">
                {data.rooms?.[0]?.occupancy?.maximumChildren || "N/A"}
              </Typography>
            </Box>
          </Box>

          <Button 
            variant="contained" 
            fullWidth 
            size="large"
            sx={{ mb: 1 }}
          >
            BOOK THIS NOW
          </Button>

          {data.rooms?.length >= 1 && <Button 
          onClick={()=>setActiveSection("rooms")}
            variant="outlined" 
            fullWidth 
            size="large"
            sx={{ mb: 2 }}
          >
            {data.rooms?.length} More Options
          </Button>}

          <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
            Booking since {data.bookingSince || "N/A"}
          </Typography>
        </Paper>
      </Grid>
    </Grid>

    {/* Property Details - Now full width */}
    <Grid container spacing={3}>
      <Grid item size={{xs:12}}>
        <Box sx={{ space: 3 }}>
          {/* Basic Info */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Property Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item size={{xs:6}}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Home fontSize="small" color="disabled" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Property Type
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {data.rentalForm || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item size={{xs:6}}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday fontSize="small" color="disabled" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Built Year
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {data.propertyBuilt || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item size={{xs:6}}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Email fontSize="small" color="disabled" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Contact Email
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {data.email || "N/A"}
                    </Typography>
                    {data.emailVerified && (
                      <Chip 
                        label="Verified" 
                        size="small" 
                        variant="outlined"
                        icon={<Verified />}
                      />
                    )}
                  </Box>
                </Box>
              </Grid>
              
              <Grid item size={{xs:6}}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Phone fontSize="small" color="disabled" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Contact Mobile
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {data.mobileNumber || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Amenities */}
          {data.amenities && <AmenitiesSection amenities={data.amenities} />}
        </Box>
      </Grid>
       
      </Grid>

      {/* Image Gallery Dialog */}
      {data.media?.images && data.media.images.length > 0 && (
        <Dialog
          open={openGallery}
          onClose={() => setOpenGallery(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { height: '90vh' }
          }}
        >
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">
                    Property Photos ({filteredImages.length})
                  </Typography>
                  <IconButton onClick={() => setOpenGallery(false)}>
                    <Close />
                  </IconButton>
                </Box>
              </Box>

              {/* Image Categories Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={selectedTab}
                  onChange={(e, newValue) => setSelectedTab(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {imageCategories.map((category, index) => (
                    <Tab key={category} label={category} />
                  ))}
                </Tabs>
              </Box>

              {/* Image Grid */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                <ImageList variant="masonry" cols={3} gap={8}>
                  {filteredImages.map((image, index) => (
                    <ImageListItem key={image._id || index}>
                      <img
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${image.url}`}
                        alt={`Property ${image.tags ? image.tags.join(', ') : 'image'}`}
                        loading="lazy"
                        style={{
                          cursor: 'pointer',
                          borderRadius: 8
                        }}
                        onClick={() => setSelectedImage(index)}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  )
}
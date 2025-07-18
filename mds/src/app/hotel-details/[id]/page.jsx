"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { 
  Box, 
  Container, 
  Typography, 
  Chip, 
  Paper, 
  AppBar, 
  Toolbar,
  Button,
  Rating,
  Divider
} from "@mui/material"
import { Star, LocationOn } from "@mui/icons-material"

import RoomsSection from "@/component/hotel-details/rooms-section"
import LocationSection from "@/component/hotel-details/location-section"
import PropertyRules from "@/component/hotel-details/property-rules"
import { getViewProperty } from "@/redux/features/property/propertySlice"
import PropertyOverview from "@/component/hotel-details/PropertyOverview"

const sections = [
  { id: "overview", label: "OVERVIEW", component: PropertyOverview },
  { id: "rooms", label: "ROOMS", component: RoomsSection },
  { id: "location", label: "LOCATION", component: LocationSection },
  { id: "rules", label: "PROPERTY RULES", component: PropertyRules },
  { id: "reviews", label: "USER REVIEWS", component: null },
  { id: "similar", label: "SIMILAR PROPERTIES", component: null },
]

export default function PropertyDetailsPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { ViewProperty, loading, error } = useSelector((state) => state.property)
  console.log(ViewProperty)
  
  const [activeSection, setActiveSection] = useState("overview")
  const [isSticky, setIsSticky] = useState(false)
  const sectionRefs = useRef({})
  const navRef = useRef(null)

  useEffect(() => {
    if (id) {
      dispatch(getViewProperty(id))
    }
  }, [id, dispatch])

  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current) return

      const navHeight = navRef.current.offsetHeight
      const scrollTop = window.pageYOffset
      const navTop = navRef.current.offsetTop

      // Check if navigation should be sticky
      setIsSticky(scrollTop > navTop)

      // Find current section
      const sectionOffsets = sections.map((section) => ({
        id: section.id,
        offset: sectionRefs.current[section.id]?.offsetTop - navHeight - 20 || 0,
      }))

      const currentSection = sectionOffsets
        .filter((section) => scrollTop >= section.offset)
        .pop()

      if (currentSection && currentSection.id !== activeSection) {
        setActiveSection(currentSection.id)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [activeSection])
  console.log(activeSection)

  const scrollToSection = (sectionId) => {
    const element = sectionRefs.current[sectionId]
    if (element) {
      const navHeight = navRef.current?.offsetHeight || 0
      const elementTop = element.offsetTop - navHeight - 20
      window.scrollTo({
        top: elementTop,
        behavior: "smooth",
      })
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Loading property details...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography color="error">Error loading property: {error}</Typography>
      </Box>
    )
  }

  if (!ViewProperty) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Property not found</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: "100vh", marginTop:"80px", bgcolor: "grey.50" }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Property Header */}
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              {ViewProperty.placeName}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Star sx={{ color: "gold", fontSize: 20 }} />
              <Typography variant="body1" fontWeight="semibold">
                {ViewProperty.placeRating}
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1} mb={2} color="text.secondary">
            <LocationOn fontSize="small" />
            <Typography variant="body2">
              {ViewProperty.location?.street}, {ViewProperty.location?.city}, {ViewProperty.location?.state}
            </Typography>
          </Box>
          
          <Chip 
            label={ViewProperty.propertyType} 
            variant="outlined" 
            size="small"
          />
        </Box>

        {/* Sticky Navigation */}
        <Paper
          ref={navRef}
          sx={{
            position: isSticky ? "fixed" : "static",
            top: isSticky ? 0 : "auto",
            left: 0,
            right: 0,
            zIndex: 1000,
            borderRadius: isSticky ? 0 : 1,
            mb: 3,
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "flex",
                overflowX: "auto",
                py: 1,
                "& > *": { minWidth: "max-content" },
              }}
            >
              {sections.map((section) => (
                <Button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  sx={{
                    mx: 1,
                    py: 1,
                    px: 2,
                    minWidth: "auto",
                    borderBottom: activeSection === section.id ? 2 : 0,
                    borderColor: "primary.main",
                    borderRadius: 0,
                    color: activeSection === section.id ? "primary.main" : "text.primary",
                    fontWeight: activeSection === section.id ? "bold" : "normal",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  {section.label}
                </Button>
              ))}
            </Box>
          </Container>
        </Paper>

        {/* Add spacing when nav is sticky */}
        {isSticky && <Box sx={{ height: "64px" }} />}

        {/* Sections */}
        <Box sx={{ space: 6 }}>
          {sections.map((section) => (
            <Box
              key={section.id}
              ref={(el) => (sectionRefs.current[section.id] = el)}
              id={section.id}
              sx={{ mb: 6 }}
            >
              
              {section?.component && (
                
                <section.component 
                  setActiveSection={scrollToSection}
                  data={ViewProperty}
                  location={ViewProperty?.location}
                  rooms={ViewProperty?.rooms}
                  amenities={ViewProperty?.amenities}
                />
              )}
              
              {section.id === "reviews" && (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                  <Typography variant="h5" fontWeight="semibold" gutterBottom>
                    User Reviews
                  </Typography>
                  <Typography color="text.secondary">
                    Reviews section coming soon...
                  </Typography>
                </Paper>
              )}
              
              {section.id === "similar" && (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                  <Typography variant="h5" fontWeight="semibold" gutterBottom>
                    Similar Properties
                  </Typography>
                  <Typography color="text.secondary">
                    Similar properties section coming soon...
                  </Typography>
                </Paper>
              )}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  )
}
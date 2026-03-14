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
  Button,
} from "@mui/material"
import { LocationOn } from "@mui/icons-material"

import RoomsSection from "@/component/hotel-details/rooms-section"
import LocationSection from "@/component/hotel-details/location-section"
import PropertyRules from "@/component/hotel-details/property-rules"
import { getViewProperty } from "@/redux/features/property/propertySlice"
import PropertyOverview from "@/component/hotel-details/PropertyOverview"
import SimilarProperties from "@/component/hotel-details/SimilarProperties"

// Remove components from the array; keep it just for the Navigation logic
const sections = [
  { id: "overview",  label: "OVERVIEW" },
  { id: "rooms",     label: "ROOMS" },
  { id: "location",  label: "LOCATION" },
  { id: "rules",     label: "PROPERTY RULES" },
  { id: "similar",   label: "SIMILAR PROPERTIES" },
]

export default function PropertyDetailsPage() {
  
  const { slug } = useParams()
  const dispatch = useDispatch()
  const { ViewProperty, loading, error } = useSelector((state) => state.property)
  
  const [activeSection, setActiveSection] = useState("overview")
  const [isSticky, setIsSticky] = useState(false)
  const sectionRefs = useRef({})
  const navRef = useRef(null)

  useEffect(() => {
    if (slug) {
      dispatch(getViewProperty(slug))
    }
  }, [slug, dispatch])

  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current) return

      const navHeight = navRef.current.offsetHeight
      const scrollTop = window.pageYOffset
      const navTop = navRef.current.offsetTop

      // Check if navigation should be sticky
      setIsSticky(scrollTop > navTop)

      // Use getBoundingClientRect for accurate offset calculation when elements are nested
      const sectionOffsets = sections.map((section) => {
        const element = sectionRefs.current[section.id]
        return {
          id: section.id,
          offset: element ? (element.getBoundingClientRect().top + window.pageYOffset - navHeight - 20) : 0,
        }
      })

      const currentSection = sectionOffsets
        .filter((section) => scrollTop >= section.offset - 50) // Added small buffer
        .pop()

      if (currentSection && currentSection.id !== activeSection) {
        setActiveSection(currentSection.id)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [activeSection])

  const scrollToSection = (sectionId) => {
    const element = sectionRefs.current[sectionId]
    if (element) {
      const navHeight = navRef.current?.offsetHeight || 0
      const elementTop = element.getBoundingClientRect().top + window.pageYOffset - navHeight - 20
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

  const commonProps = {
    setActiveSection: scrollToSection,
    data: ViewProperty,
    propertyId: ViewProperty?._id,
    location: ViewProperty?.location,
    rooms: ViewProperty?.rooms,
    amenities: ViewProperty?.amenities,
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
            zIndex: 30,
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

        {isSticky && <Box sx={{ height: "64px" }} />}

        {/* Sections - Manually structured to fix layout gap */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          
          <Box ref={(el) => (sectionRefs.current["overview"] = el)}>
            <PropertyOverview {...commonProps} />
          </Box>

          <Box ref={(el) => (sectionRefs.current["rooms"] = el)}>
            <RoomsSection {...commonProps} />
          </Box>

          {/* Location & Rules Grouped Grid */}
          <Box ref={(el) => (sectionRefs.current["location"] = el)}>
            <LocationSection location={ViewProperty?.location}>
               {/* PropertyRules renders underneath the map here */}
               <Box ref={(el) => (sectionRefs.current["rules"] = el)}>
                  <PropertyRules propertyId={ViewProperty?._id} />
               </Box>
            </LocationSection>
          </Box>

          <Box ref={(el) => (sectionRefs.current["similar"] = el)}>
            <SimilarProperties {...commonProps} />
          </Box>

        </Box>
      </Container>
    </Box>
  )
}
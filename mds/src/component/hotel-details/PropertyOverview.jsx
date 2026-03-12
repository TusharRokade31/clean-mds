// components/PropertyOverview.jsx
"use client"

import {
  Paper, Typography, Box, Grid, Chip, Button,
  Tab, Tabs, ImageList, ImageListItem,
  Dialog, DialogContent, IconButton
} from "@mui/material"
import {
  CalendarToday, Home, Email, Phone, Verified,
  Close, ShoppingCartOutlined
} from "@mui/icons-material"
import { useState, useEffect } from "react"
import AmenitiesSection from "./amenities-section"
import BookingConfirmationDialog from "./BookingConfirmationDialog"

const CART_KEY = "roomsCart_v2"

const nightlyRate = (room, adults, children) => {
  if (!room) return 0
  const base  = room.pricing?.baseAdultsCharge  || 0
  const eRate = room.pricing?.extraAdultsCharge || 0
  const cRate = room.pricing?.childCharge       || 0
  const extra = Math.max(0, adults - (room.occupancy?.baseAdults || 1))
  return base + extra * eRate + children * cRate
}

export default function PropertyOverview({ data, setActiveSection }) {
  const [selectedTab,        setSelectedTab]        = useState(0)
  const [openGallery,        setOpenGallery]        = useState(false)
  const [selectedImage,      setSelectedImage]      = useState(0)
  const [bookingConfirmOpen, setBookingConfirmOpen] = useState(false)

  // Live cart from sessionStorage (updated whenever rooms-section writes it)
  const [cartRooms,  setCartRooms]  = useState([])
  const [cartNightly, setCartNightly] = useState(0)

  // Poll sessionStorage on mount and when tab regains focus
  const refreshCart = () => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(CART_KEY) || "[]")
      setCartRooms(saved)
      const total = saved.reduce((s, c) => {
        const room = data?.rooms?.find(r => r._id === c.roomId)
        return room ? s + nightlyRate(room, c.guestCount.adults, c.guestCount.children) : s
      }, 0)
      setCartNightly(total)
    } catch {}
  }

  useEffect(() => {
    refreshCart()
    // Refresh whenever user switches back to this tab/page
    window.addEventListener("focus", refreshCart)
    // Also poll every 500ms in case of same-tab navigation
    const interval = setInterval(refreshCart, 500)
    return () => {
      window.removeEventListener("focus", refreshCart)
      clearInterval(interval)
    }
  }, [data])

  if (!data) return <Typography>Loading...</Typography>

  // ── Image helpers ──────────────────────────────────────────────────────────
  const getImageCategories = () => {
    if (!data.media?.images?.length) return ["All"]
    const cats = [...new Set(data.media.images.flatMap(img => img.tags || []))]
    return ["All", ...cats]
  }

  const getFilteredImages = () => {
    if (!data.media?.images?.length) return []
    const cats = getImageCategories()
    const sel  = cats[selectedTab]
    const base = sel === "All"
      ? [...data.media.images]
      : data.media.images.filter(img => img.tags?.includes(sel))
    return base.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  }

  const getCoverImage = () => {
    if (!data.media?.images?.length) return null
    return data.media.images.find(img => img.isCover) || data.media.images[0]
  }

  const getDisplayImages = () => {
    if (!data.media?.images?.length) return []
    return [...data.media.images]
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .slice(0, 5)
  }

  const coverImage      = getCoverImage()
  const displayImages   = getDisplayImages()
  const imageCategories = getImageCategories()
  const filteredImages  = getFilteredImages()

  const lowestPrice = data.rooms?.length
    ? Math.min(...data.rooms.map(r => r.pricing?.baseAdultsCharge || 0))
    : 0

  const hasCart = cartRooms.length > 0

  return (
    <Box>
      {/* Images + Booking Card */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Images */}
        <Grid item size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 0 }}>
            <Grid container spacing={1}>
              <Grid item size={{ xs: 12 }}>
                <Box sx={{ aspectRatio: "16/9", bgcolor: "grey.200", borderRadius: 1, overflow: "hidden", cursor: "pointer", position: "relative" }}
                  onClick={() => { setSelectedImage(0); setOpenGallery(true) }}>
                  {coverImage
                    ? <img src={coverImage.url} alt="Property" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Typography color="text.secondary">No image available</Typography>
                      </Box>
                  }
                  {data.media?.images?.length > 0 && (
                    <Box sx={{ position: "absolute", bottom: 16, left: 16, bgcolor: "rgba(0,0,0,0.7)", color: "white", px: 2, py: 1, borderRadius: 1 }}>
                      <Typography variant="body2">+{data.media.images.length} Photos</Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item size={{ xs: 12 }}>
                <Grid container spacing={1}>
                  {displayImages.slice(1, 5).map((image, index) => (
                    <Grid item size={{ xs: 6, md: 3 }} key={image._id || index}>
                      <Box sx={{ aspectRatio: "1/1", bgcolor: "grey.200", borderRadius: 1, overflow: "hidden", cursor: "pointer", position: "relative" }}
                        onClick={() => { setSelectedImage(index + 1); setOpenGallery(true) }}>
                        <img src={image.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        {index === 3 && data.media?.images?.length > 5 && (
                          <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                            <Typography variant="h6">+{data.media.images.length - 5} More</Typography>
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

        {/* Booking Card */}
        <Grid item size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, position: "sticky", top: "100px", height: "fit-content" }}>
            <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
              {hasCart ? "Your selection" : "Starting from"}
            </Typography>

            {/* Price display: show cart total when cart has items, else lowest price */}
            {hasCart ? (
              <Box mb={2}>
                <Box display="flex" alignItems="baseline" gap={0.5}>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: "#1035ac" }}>
                    ₹{cartNightly}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">/night</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5} mt={0.5}
                  sx={{ bgcolor: "#e8edf8", borderRadius: 1, px: 1.5, py: 0.5, display: "inline-flex" }}>
                  <ShoppingCartOutlined sx={{ fontSize: 14, color: "#1035ac" }} />
                  <Typography variant="caption" sx={{ color: "#1035ac", fontWeight: 600 }}>
                    {cartRooms.length} room{cartRooms.length > 1 ? "s" : ""} added
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box mb={2}>
                <Box display="flex" alignItems="baseline" gap={0.5}>
                  <Typography variant="h4" fontWeight="bold">₹{lowestPrice}</Typography>
                  <Typography variant="body2" color="text.secondary">/night</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Fits up to {data.rooms?.[0]?.occupancy?.maximumAdults || 2} adults
                </Typography>
              </Box>
            )}

            <Box mb={2}>
              <Chip label="No meals included" size="small" sx={{ mr: 1, mb: 1 }} />
              <Chip label="Non-Refundable"    size="small" />
            </Box>

            {hasCart ? (
              <>
                <Button variant="contained" className="bg-[#1035ac]" fullWidth size="large" sx={{ mb: 1 }}
                  onClick={() => setBookingConfirmOpen(true)}>
                  Proceed to Book ({cartRooms.length} room{cartRooms.length > 1 ? "s" : ""})
                </Button>
                <Button variant="outlined" fullWidth size="large" sx={{ mb: 2 }}
                  onClick={() => setActiveSection("rooms")}>
                  Edit Room Selection
                </Button>
              </>
            ) : (
              <>
                <Button variant="contained" fullWidth size="large" sx={{ mb: 1 }}
                  onClick={() => setBookingConfirmOpen(true)}>
                  BOOK THIS NOW
                </Button>
                {data.rooms?.length >= 1 && (
                  <Button variant="outlined" fullWidth size="large" sx={{ mb: 2 }}
                    onClick={() => setActiveSection("rooms")}>
                    {data.rooms.length} Room Options
                  </Button>
                )}
              </>
            )}

            <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
              Booking since {data.bookingSince || "N/A"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Property Details */}
      <Grid container spacing={3}>
        <Grid item size={{ xs: 12 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Property Information</Typography>
            <Grid container spacing={2}>
              <Grid item size={{ xs: 6 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Home fontSize="small" color="disabled" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Property Type</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {data.propertyType === "Dharamshala (Basic spiritual lodging run by religious trusts or communities)"
                        ? "Dharamshala" : data.propertyType || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item size={{ xs: 6 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday fontSize="small" color="disabled" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Built Year</Typography>
                    <Typography variant="body1" fontWeight="medium">{data.propertyBuilt || "N/A"}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item size={{ xs: 6 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Email fontSize="small" color="disabled" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Contact Email</Typography>
                    <Typography variant="body1" fontWeight="medium">{data.email || "N/A"}</Typography>
                    {data.emailVerified && <Chip label="Verified" size="small" variant="outlined" icon={<Verified />} />}
                  </Box>
                </Box>
              </Grid>
              <Grid item size={{ xs: 6 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Phone fontSize="small" color="disabled" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Contact Mobile</Typography>
                    <Typography variant="body1" fontWeight="medium">{data.mobileNumber || "N/A"}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {data.amenities && <AmenitiesSection amenities={data.amenities} />}
        </Grid>
      </Grid>

      {/* Gallery Dialog */}
      {data.media?.images?.length > 0 && (
        <Dialog open={openGallery} onClose={() => setOpenGallery(false)} maxWidth="lg" fullWidth
          PaperProps={{ sx: { height: "90vh" } }}>
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Property Photos ({filteredImages.length})</Typography>
                  <IconButton onClick={() => setOpenGallery(false)}><Close /></IconButton>
                </Box>
              </Box>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)} variant="scrollable" scrollButtons="auto">
                  {imageCategories.map(c => <Tab key={c} label={c} />)}
                </Tabs>
              </Box>
              <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
                <ImageList variant="masonry" cols={3} gap={8}>
                  {filteredImages.map((img, i) => (
                    <ImageListItem key={img._id || i}>
                      <img src={img.url} alt="" loading="lazy" style={{ cursor: "pointer", borderRadius: 8 }}
                        onClick={() => setSelectedImage(i)} />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      )}

      {/* Booking Confirmation Dialog */}
      <BookingConfirmationDialog
        // If cart has items use them; else use first room as fallback
        selectedRooms={hasCart ? cartRooms : []}
        rooms={data.rooms || []}
        room={!hasCart ? data.rooms?.[0] : null}
        property={data}
        open={bookingConfirmOpen}
        onClose={() => setBookingConfirmOpen(false)}
      />
    </Box>
  )
}
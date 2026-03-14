"use client"
import { useState, useEffect, useMemo } from "react"
import {
  Dialog, DialogContent, DialogTitle, IconButton, Button, Box,
  Typography, Grid, Paper, Divider, Alert, ThemeProvider, createTheme, Chip
} from "@mui/material"
import { DatePicker }          from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns }      from "@mui/x-date-pickers/AdapterDateFns"
import CalendarTodayIcon       from "@mui/icons-material/CalendarToday"
import CloseIcon               from "@mui/icons-material/Close"
import PeopleAltIcon           from "@mui/icons-material/PeopleAlt"
import LocationOnIcon          from "@mui/icons-material/LocationOn"
import BedIcon                 from "@mui/icons-material/Bed"
import NightsStayIcon          from "@mui/icons-material/NightsStay"
import { usePathname, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { checkRoomAvailability } from "@/redux/features/rooms/roomSlice"

/* ─── Theme ─────────────────────────────────────────────────────────────── */
const theme = createTheme({
  palette: {
    primary: { main: "#0f2b5b", light: "#2c4f8a", dark: "#071a38", contrastText: "#ffffff" },
    secondary: { main: "#c9a84c" },
  },
  typography: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", letterSpacing: "0.03em" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#0f2b5b" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0f2b5b", borderWidth: 2 },
        },
      },
    },
  },
})

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const nightlyRate = (room, adults, extraGaddis = 0) => {
  if (!room) return 0
  const bedCapacity   = room?.beds?.reduce((s, b) => s + (b.count * b.accommodates), 0) || 1
  const perGaddi      = parseInt(room?.FloorBedding?.peoplePerFloorBedding || 1)
  const gaddiRate     = room.pricing?.extraFloorBeddingCharge || 0
  const extraAdults   = Math.max(0, adults - bedCapacity)
  const matsForAdults = extraAdults > 0 ? Math.ceil(extraAdults / perGaddi) : 0
  return (room.pricing?.baseAdultsCharge || 0) + (matsForAdults + extraGaddis) * gaddiRate
}

const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n)

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const styles = {
  dialog: {
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 32px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.1)",
  },
  header: {
    background: "linear-gradient(135deg, #0f2b5b 0%, #1a4080 60%, #0f2b5b 100%)",
    px: { xs: 2.5, sm: 3.5 },
    pt: { xs: 2.5, sm: 3 },
    pb: 2.5,
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "3px",
      background: "linear-gradient(90deg, #c9a84c, #f0d080, #c9a84c)",
    },
  },
  closeBtn: {
    color: "rgba(255,255,255,0.7)",
    "&:hover": { color: "#fff", background: "rgba(255,255,255,0.12)" },
    transition: "all 0.2s",
  },
  propertyCard: {
    p: { xs: 1.75, sm: 2.25 },
    borderRadius: "14px",
    background: "linear-gradient(145deg, #f0f5ff 0%, #e8f0fe 100%)",
    border: "1px solid #d0dcf5",
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0, left: 0,
      width: "4px", height: "100%",
      background: "linear-gradient(180deg, #c9a84c, #0f2b5b)",
      borderRadius: "4px 0 0 4px",
    },
  },
  roomRow: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    bgcolor: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(15,43,91,0.08)",
    borderRadius: "10px",
    px: { xs: 1.5, sm: 2 },
    py: { xs: 0.9, sm: 1.1 },
    transition: "box-shadow 0.2s",
    "&:hover": { boxShadow: "0 2px 12px rgba(15,43,91,0.1)" },
  },
  sectionLabel: {
    display: "flex",
    alignItems: "center",
    gap: 0.75,
    mb: 1.25,
    "& .MuiTypography-root": {
      fontWeight: 700,
      fontSize: "0.8rem",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "#0f2b5b",
    },
    "& .MuiSvgIcon-root": { fontSize: 15, color: "#c9a84c" },
  },
  datePicker: {
    borderRadius: "10px",
    "& .MuiInputLabel-root.Mui-focused": { color: "#0f2b5b" },
  },
  priceCard: {
    p: { xs: 2, sm: 2.5 },
    borderRadius: "14px",
    border: "1px solid #d0dcf5",
    background: "#fafcff",
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    py: 0.6,
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    bgcolor: "#0f2b5b",
    borderRadius: "10px",
    px: 2,
    py: 1.25,
    mt: 1,
  },
  cancelBtn: {
    borderRadius: "12px",
    py: { xs: 1.2, sm: 1.4 },
    fontWeight: 600,
    fontSize: "0.9rem",
    borderColor: "#0f2b5b",
    color: "#0f2b5b",
    borderWidth: "1.5px",
    "&:hover": { borderWidth: "1.5px", bgcolor: "rgba(15,43,91,0.05)" },
    flex: 1,
  },
  confirmBtn: {
    borderRadius: "12px",
    py: { xs: 1.2, sm: 1.4 },
    fontWeight: 700,
    fontSize: "0.9rem",
    background: "linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #c9a84c 100%)",
    backgroundSize: "200% 100%",
    color: "#0f2b5b",
    boxShadow: "0 4px 16px rgba(201,168,76,0.4)",
    "&:hover": {
      backgroundPosition: "100% 0",
      boxShadow: "0 6px 24px rgba(201,168,76,0.5)",
    },
    "&:disabled": { background: "#e0e0e0", color: "#999", boxShadow: "none" },
    transition: "all 0.3s ease",
    flex: 2,
  },
}

/* ─── Component ──────────────────────────────────────────────────────────── */
/**
 * BookingConfirmationDialog
 *
 * selectedRooms: [{ cartKey, roomId, roomName, guestCount }]  — multi-room cart
 * rooms:         full room objects from property
 * room:          (legacy) single room object
 */
export default function BookingConfirmationDialog({
  selectedRooms = [],
  rooms         = [],
  room          = null,
  property,
  open,
  onClose,
  isLoading = false,
}) {
  const pathName = usePathname()
  const router   = useRouter()
  const dispatch = useDispatch()

  const { searchQuery }     = useSelector(s => s.property)
  const { isAuthenticated } = useSelector(s => s.auth)

  const effectiveRooms = useMemo(() => {
    if (selectedRooms.length > 0) return selectedRooms
    if (room) return [{ cartKey: room._id, roomId: room._id, roomName: room.roomName, guestCount: { adults: 1, extraGaddis: 0 } }]
    return []
  }, [selectedRooms, room])

  const getRoomObj = (roomId) =>
    rooms.find(r => r._id === roomId) || (room?._id === roomId ? room : null)

  const [dates, setDates]                             = useState({ checkIn: null, checkOut: null })
  const [errors, setErrors]                           = useState({})
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError]     = useState("")

  useEffect(() => {
    if (!open) return
    if (!isAuthenticated) localStorage.setItem("hoteldetailPath", pathName)
    else localStorage.removeItem("hoteldetailPath")
    if (searchQuery) {
      setDates({
        checkIn:  searchQuery.checkin  ? new Date(searchQuery.checkin)  : null,
        checkOut: searchQuery.checkout ? new Date(searchQuery.checkout) : null,
      })
    }
  }, [open])

  const nights = useMemo(() => {
    if (!dates.checkIn || !dates.checkOut) return 0
    return Math.max(0, Math.ceil((dates.checkOut - dates.checkIn) / 864e5))
  }, [dates.checkIn, dates.checkOut])

  const totalGuests = useMemo(() =>
    effectiveRooms.reduce((s, r) => ({
      adults:      s.adults      + (r.guestCount?.adults      || 0),
      extraGaddis: s.extraGaddis + (r.guestCount?.extraGaddis || 0),
    }), { adults: 0, extraGaddis: 0 }),
  [effectiveRooms])

  const estimatedTotal = useMemo(() => {
    if (!nights) return 0
    return effectiveRooms.reduce((sum, er) => {
      const ro   = getRoomObj(er.roomId)
      const rate = nightlyRate(ro, er.guestCount?.adults || 1, er.guestCount?.extraGaddis || 0)
      return sum + rate * nights
    }, 0)
  }, [effectiveRooms, nights])

  const validate = () => {
    const e = {}
    const today = new Date(); today.setHours(0,0,0,0)
    if (!dates.checkIn)  e.checkIn  = "Check-in date is required"
    else if (dates.checkIn < today) e.checkIn = "Check-in cannot be in the past"
    if (!dates.checkOut) e.checkOut = "Check-out date is required"
    else if (dates.checkOut <= dates.checkIn) e.checkOut = "Check-out must be after check-in"
    setErrors(e)
    return !Object.keys(e).length
  }

const handleConfirm = async () => {
  // ── Not logged in → close modal, redirect to login ───────────────────────
  // (Only redirect in this case — everything else stays inside the modal.)
  if (!isAuthenticated) {
    onClose()
    router.push("/login")
    return
  }
 
  // ── Client-side date validation ───────────────────────────────────────────
  if (!validate()) return   // validate() already sets field errors, no redirect
 
  // ── Availability check ────────────────────────────────────────────────────
  setAvailabilityLoading(true)
  setAvailabilityError("")          // clear any previous error
 
  try {
    // Group cart items by roomId so we know how many units the user wants per room type
    const roomGroups = effectiveRooms.reduce((acc, er) => {
      if (!acc[er.roomId]) acc[er.roomId] = { roomName: er.roomName, count: 0 }
      acc[er.roomId].count += 1
      return acc
    }, {})

    for (const [roomId, { roomName, count: wantedCount }] of Object.entries(roomGroups)) {
      const result = await dispatch(
        checkRoomAvailability({
          roomId,
          startDate: dates.checkIn.toISOString().split("T")[0],
          endDate:   dates.checkOut.toISOString().split("T")[0],
        })
      ).unwrap()

      const availableUnits = result?.data?.availableUnits ?? 0
      const totalUnits     = result?.data?.totalUnits     ?? 1

      // Two failure cases:
      // 1. Room is fully booked (0 units left)
      // 2. User wants more units than are available (e.g. wants 3, only 2 free)
      if (!result?.data?.available || wantedCount > availableUnits) {
        const msg = availableUnits === 0
          ? `"${roomName}" is fully booked for the selected dates. Please choose different dates.`
          : `You selected ${wantedCount} unit(s) of "${roomName}", but only ${availableUnits} of ${totalUnits} are available for these dates. Please remove ${wantedCount - availableUnits} from your selection.`

        setAvailabilityError(msg)
        setAvailabilityLoading(false)

        setTimeout(() => {
          document.getElementById("availability-error-alert")?.scrollIntoView({
            behavior: "smooth", block: "center",
          })
        }, 100)

        return
      }
    }
  } catch (err) {
    // Network / server error — still stay in the modal
    setAvailabilityError("Could not check availability. Please try again.")
    setAvailabilityLoading(false)
    return   // ← stays in the modal, NO redirect
  }
 
  setAvailabilityLoading(false)
 
  // ── All rooms available — now redirect to booking page ───────────────────
  const sq = {
    checkin:     dates.checkIn.toISOString().split("T")[0],
    checkout:    dates.checkOut.toISOString().split("T")[0],
    persons:     totalGuests.adults.toString(),
    extraGaddis: totalGuests.extraGaddis.toString(),
    location:    property?.location?.city || "",
    propertyId:  property?._id,
  }
  localStorage.setItem("lastSearchQuery",  JSON.stringify(sq))
  localStorage.setItem("selectedRooms",    JSON.stringify(effectiveRooms))
  localStorage.setItem("selectedProperty", JSON.stringify(property))
  if (effectiveRooms.length === 1) {
    const ro = getRoomObj(effectiveRooms[0].roomId)
    if (ro) localStorage.setItem("selectedRoom", JSON.stringify(ro))
  }
 
  router.push(`/booking/${property._id}?checkIn=${sq.checkin}&checkOut=${sq.checkout}`)
}

  if (!property || effectiveRooms.length === 0) return null
  const busy = isLoading || availabilityLoading

  const confirmLabel = availabilityLoading
    ? "Checking availability…"
    : isLoading
    ? "Processing…"
    : !isAuthenticated
    ? "Login to Continue"
    : "Confirm & Continue →"

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: styles.dialog }}
        >
          {/* ── Header ── */}
          <DialogTitle sx={{ p: 0 }}>
            <Box sx={styles.header}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ color: "#c9a84c", fontSize: "0.7rem", letterSpacing: "0.14em", fontWeight: 600, display: "block", mb: 0.25 }}
                  >
                    Booking Summary
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, lineHeight: 1.2, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                    Confirm Your Stay
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.75} flexWrap="wrap">
                    <Chip
                      size="small"
                      icon={<BedIcon sx={{ fontSize: "13px !important", color: "#c9a84c !important" }} />}
                      label={`${effectiveRooms.length} Room${effectiveRooms.length > 1 ? "s" : ""}`}
                      sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff", fontSize: "0.72rem", height: 22, "& .MuiChip-icon": { ml: "6px" } }}
                    />
                    <Chip
                      size="small"
                      label={`${totalGuests.adults} Adult${totalGuests.adults > 1 ? "s" : ""}${totalGuests.extraGaddis > 0 ? ` · ${totalGuests.extraGaddis} Gaddi` : ""}`}
                      sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff", fontSize: "0.72rem", height: 22 }}
                    />
                    {nights > 0 && (
                      <Chip
                        size="small"
                        icon={<NightsStayIcon sx={{ fontSize: "13px !important", color: "#c9a84c !important" }} />}
                        label={`${nights} Night${nights > 1 ? "s" : ""}`}
                        sx={{ bgcolor: "rgba(201,168,76,0.25)", color: "#f0d080", fontSize: "0.72rem", height: 22, "& .MuiChip-icon": { ml: "6px" } }}
                      />
                    )}
                  </Box>
                </Box>
                <IconButton onClick={onClose} disabled={busy} sx={styles.closeBtn} size="small">
                  <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>

          {/* ── Body ── */}
          <DialogContent sx={{ px: { xs: 2.5, sm: 3.5 }, pb: { xs: 2.5, sm: 3.5 }, pt: 2.5 }}>

            {/* Alerts */}
            {!isAuthenticated && (
              <Alert
                severity="info"
                sx={{ mb: 2, borderRadius: "10px", fontSize: "0.82rem",
                  "& .MuiAlert-icon": { color: "#0f2b5b" },
                  bgcolor: "#eef2fc", border: "1px solid #c3d0f0", color: "#0f2b5b" }}
              >
                Please log in to complete your booking.
              </Alert>
            )}
            {availabilityError && (
            <Alert
      id="availability-error-alert"          // ← ADD THIS
      severity="error"
      sx={{ mb: 2, borderRadius: "10px", fontSize: "0.82rem" }}
    >
      {availabilityError}
    </Alert>
            )}

            <Box display="flex" flexDirection="column" gap={2.5}>

              {/* ── Property + rooms ── */}
              <Box>
                <Box sx={styles.sectionLabel}>
                  <LocationOnIcon />
                  <Typography>Property</Typography>
                </Box>
                <Box sx={{ ...styles.propertyCard, pl: { xs: 2.5, sm: 3 } }}>
                  <Box mb={1.5}>
                    <Typography variant="subtitle1" fontWeight={700} color="primary.main" sx={{ lineHeight: 1.3 }}>
                      {property.placeName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.25 }}>
                      <LocationOnIcon sx={{ fontSize: 12 }} />
                      {property.location?.city}, {property.location?.state}
                    </Typography>
                  </Box>

                  <Box display="flex" flexDirection="column" gap={0.85}>
                    {effectiveRooms.map(er => {
                      const ro = getRoomObj(er.roomId)
                      return (
                        <Box key={er.cartKey} sx={styles.roomRow}>
                          <Box sx={{ bgcolor: "#0f2b5b", borderRadius: "8px", p: 0.7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <BedIcon sx={{ color: "#c9a84c", fontSize: 15 }} />
                          </Box>
                          <Typography variant="body2" fontWeight={600} color="primary.main" sx={{ flex: 1, fontSize: { xs: "0.78rem", sm: "0.85rem" } }}>
                            {er.roomName}
                          </Typography>
                          <Chip
                            size="small"
                            label={`${er.guestCount.adults}A${er.guestCount.extraGaddis > 0 ? ` · ${er.guestCount.extraGaddis} gaddi` : ""}`}
                            sx={{ bgcolor: "rgba(15,43,91,0.08)", color: "primary.main", fontSize: "0.67rem", fontWeight: 700, height: 20, borderRadius: "6px" }}
                          />
                          {ro && (
                            <Typography variant="caption" sx={{ color: "#c9a84c", fontWeight: 700, whiteSpace: "nowrap" }}>
                              ₹{fmtINR(nightlyRate(ro, er.guestCount.adults, er.guestCount.children))}<span style={{ fontWeight: 400, color: "#888", fontSize: "0.65rem" }}>/n</span>
                            </Typography>
                          )}
                        </Box>
                      )
                    })}
                  </Box>
                </Box>
              </Box>

              {/* ── Dates ── */}
              <Box>
                <Box sx={styles.sectionLabel}>
                  <CalendarTodayIcon />
                  <Typography>Select Dates</Typography>
                </Box>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Check-in"
                      value={dates.checkIn}
                      onChange={v => setDates(p => ({ ...p, checkIn: v }))}
                      minDate={new Date()}
                      disabled={busy}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          error: !!errors.checkIn,
                          helperText: errors.checkIn,
                          sx: styles.datePicker,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Check-out"
                      value={dates.checkOut}
                      onChange={v => setDates(p => ({ ...p, checkOut: v }))}
                      minDate={dates.checkIn || new Date()}
                      disabled={busy}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          error: !!errors.checkOut,
                          helperText: errors.checkOut,
                          sx: styles.datePicker,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* ── Price summary ── */}
              {nights > 0 && (
                <Box>
                  <Box sx={styles.sectionLabel}>
                    <PeopleAltIcon />
                    <Typography>Price Breakdown</Typography>
                  </Box>
                  <Box sx={styles.priceCard}>
                    {effectiveRooms.map(er => {
                      const ro   = getRoomObj(er.roomId)
                      if (!ro) return null
                      const rate = nightlyRate(ro, er.guestCount?.adults, er.guestCount?.extraGaddis || 0)
                      return (
                        <Box key={er.cartKey} sx={styles.priceRow}>
                          <Box>
                            <Typography variant="body2" color="text.primary" fontWeight={500} sx={{ fontSize: "0.82rem" }}>
                              {er.roomName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                              ₹{fmtINR(rate)} × {nights} night{nights > 1 ? "s" : ""} · {er.guestCount.adults} adult{er.guestCount.adults > 1 ? "s" : ""}{er.guestCount.extraGaddis > 0 ? ` · ${er.guestCount.extraGaddis} gaddi` : ""}
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ fontSize: "0.88rem" }}>
                            ₹{fmtINR(rate * nights)}
                          </Typography>
                        </Box>
                      )
                    })}

                    {effectiveRooms.length > 1 && (
                      <>
                        <Divider sx={{ my: 1.25, borderStyle: "dashed" }} />
                        <Box sx={{ ...styles.priceRow, mb: 0 }}>
                          <Typography variant="caption" color="text.secondary">Subtotal ({effectiveRooms.length} rooms)</Typography>
                          <Typography variant="body2" fontWeight={600} color="text.primary">₹{fmtINR(estimatedTotal)}</Typography>
                        </Box>
                      </>
                    )}

                    <Box sx={styles.totalRow}>
                      <Box>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)", display: "block", fontSize: "0.7rem" }}>
                          Estimated Total
                        </Typography>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem" }}>
                          Taxes &amp; fees calculated at checkout
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ color: "#c9a84c", fontWeight: 800, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                        ₹{fmtINR(estimatedTotal)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* ── Actions ── */}
              <Box display="flex" gap={1.25} pt={0.5}>
                <Button variant="outlined" onClick={onClose} disabled={busy} sx={styles.cancelBtn}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleConfirm} disabled={busy} disableElevation sx={styles.confirmBtn}>
                  {confirmLabel}
                </Button>
              </Box>

            </Box>
          </DialogContent>
        </Dialog>
      </LocalizationProvider>
    </ThemeProvider>
  )
}
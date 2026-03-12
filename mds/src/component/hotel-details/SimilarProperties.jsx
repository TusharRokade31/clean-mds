// component/hotel-details/SimilarProperties.jsx
"use client"

import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Chip,
  Skeleton,
  Rating,
  IconButton,
} from "@mui/material"
import { LocationOn, ChevronLeft, ChevronRight } from "@mui/icons-material"
import { useRouter } from "next/navigation"
import { getSimilarProperties } from "@/redux/features/property/propertySlice"

// ─── Skeleton Loader Card ─────────────────────────────────────────────────────
const SimilarPropertySkeleton = () => (
  <Card
    sx={{
      borderRadius: 3,
      overflow: "hidden",
      minWidth: 280,
      maxWidth: 280,
      flex: "0 0 auto",
      height: 380,
    }}
  >
    <Skeleton variant="rectangular" height={180} width="100%" />
    <CardContent>
      <Skeleton variant="text" width="70%" height={28} />
      <Skeleton variant="text" width="45%" height={20} sx={{ mt: 0.5 }} />
      <Skeleton variant="text" width="55%" height={20} sx={{ mt: 0.5 }} />
      <Skeleton variant="rounded" width={90} height={26} sx={{ mt: 1 }} />
      <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1.5 }} />
    </CardContent>
  </Card>
)

// ─── Single Property Card ─────────────────────────────────────────────────────
const SimilarPropertyCard = ({ property }) => {
  const router = useRouter()

  const coverImage =
    property?.media?.images?.[0]?.url || "/placeholder-property.jpg"

  const startingPrice = property?.rooms?.reduce((min, room) => {
    const price = room?.pricing?.baseAdultsCharge
    return price && price < min ? price : min
  }, Infinity)

  const maxOccupancy = property?.rooms?.reduce((max, room) => {
    const occ = room?.occupancy?.maximumOccupancy
    return occ && occ > max ? occ : max
  }, 0)

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        minWidth: 280,        // ✅ Fixed width
        maxWidth: 280,
        flex: "0 0 auto",     // ✅ Never shrink or grow
        height: 350,          // ✅ Fixed total card height
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      <CardActionArea
        onClick={() => router.push(`/hotel-details/${property.slug}`)}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",  // ✅ Align from top
        }}
      >
        {/* ✅ Fixed image container — image fills this box, never overflows */}
        <Box
          sx={{
            width: "100%",
            height: 180,          // ✅ Fixed image height
            flexShrink: 0,        // ✅ Image area never shrinks
            overflow: "hidden",
            backgroundColor: "grey.200", // fallback bg while image loads
          }}
        >
          <Box
            component="img"
            src={coverImage}
            alt={property?.placeName}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",   // ✅ Crop to fill, no distortion
              display: "block",
            }}
          />
        </Box>

        {/* ✅ Content area fills remaining height */}
        <CardContent
          sx={{
            p: 2,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",   // ✅ Prevent content overflow
          }}
        >
          {/* Property Name */}
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            gutterBottom
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {property?.placeName}
          </Typography>

          {/* Location */}
          <Box display="flex" alignItems="center" gap={0.5} mb={1} color="text.secondary">
            <LocationOn sx={{ fontSize: 15, flexShrink: 0 }} />
            <Typography
              variant="caption"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {property?.location?.city}, {property?.location?.state}
            </Typography>
          </Box>

          {/* Rating */}
          {/* {property?.placeRating && (
            <Box display="flex" alignItems="center" gap={0.5} mb={1}>
              <Rating
                value={parseFloat(property.placeRating)}
                precision={0.5}
                size="small"
                readOnly
              />
              <Typography variant="caption" color="text.secondary">
                ({property.placeRating})
              </Typography>
            </Box>
          )} */}

          {/* Property Type Chip */}
          <Chip
            label={property?.propertyType?.split("(")[0].trim()}
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.65rem", alignSelf: "flex-start", mb: 1.5 }}
          />

          {/* ✅ Price + Occupancy pushed to bottom */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-end"
            mt="auto"         // ✅ Pushes to bottom of card
          >
            {startingPrice !== Infinity ? (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Starting from
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                  ₹{startingPrice?.toLocaleString("en-IN")}
                </Typography>
              </Box>
            ) : (
              <Box /> // empty spacer so occupancy still aligns right
            )}

            {maxOccupancy > 0 && (
              <Typography variant="caption" color="text.secondary">
                Up to {maxOccupancy} guests
              </Typography>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

// ─── Main Similar Properties Section ─────────────────────────────────────────
const SimilarProperties = ({ propertyId }) => {
  const dispatch = useDispatch()
  const { similarProperties, isLoading, error } = useSelector(
    (state) => state.property
  )
  const scrollRef = useRef(null)

  useEffect(() => {
    if (propertyId) dispatch(getSimilarProperties(propertyId))
  }, [propertyId, dispatch])

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      })
    }
  }

  if (!isLoading && (!similarProperties || similarProperties.length === 0)) {
    return null
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Similar Properties
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You might also be interested in these properties
          </Typography>
        </Box>

        {/* Arrow buttons */}
        <Box display="flex" gap={1} mt={0.5}>
          <IconButton
            onClick={() => scroll("left")}
            size="small"
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={() => scroll("right")}
            size="small"
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      {/* ✅ Slider container */}
      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          gap: 2.5,
          overflowX: "auto",
          pb: 1,
          scrollbarWidth: "none",           // Firefox
          "&::-webkit-scrollbar": { display: "none" }, // Chrome/Safari
        }}
      >
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <SimilarPropertySkeleton key={`skeleton-${i}`} />
          ))}

        {!isLoading &&
          similarProperties?.map((property) => (
            <SimilarPropertyCard key={property._id} property={property} />
          ))}
      </Box>

      {error && !isLoading && (
        <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
          Could not load similar properties at this time.
        </Typography>
      )}
    </Box>
  )
}

export default SimilarProperties
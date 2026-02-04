"use client";
import { useState, useEffect, useRef } from "react";
import {
  Button,
  Typography,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Paper,
  IconButton,
  Chip,
  Box,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Tabs,
  Tab,
  RadioGroup,
  Radio,
  FormLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CardMedia,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  CloudUpload,
  Star,
  StarBorder,
  Image as ImageIcon,
  VideoFile,
  Close,
  Warning,
  ExpandMore,
  ArrowBack,
  ArrowForward,
  Search,
  ContentCopy,
  Delete,
} from "@mui/icons-material";
import { useDispatch } from "react-redux";
import {
  addRooms,
  deleteRoom,
  updateRoom,
  uploadRoomMedia,
  updateRoomMediaItem,
  deleteRoomMediaItem,
  getProperty,
  completeRoomsStep,
} from "@/redux/features/property/propertySlice";
import RoomsAmenities from "./RoomsAmenities";
import toast from "react-hot-toast";

export default function RoomsForm({
  rooms = [],
  propertyId,
  onAddRoom,
  errors,
  onComplete,
  onSave,
  onBack,
}) {
  const dispatch = useDispatch();
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [isCompleted, setIsComplete] = useState(false);
  const [editingRoomIndex, setEditingRoomIndex] = useState(-1);
  const [currentRoomData, setCurrentRoomData] = useState(getInitialRoomData());
  const [localRooms, setLocalRooms] = useState(rooms);
  const [selectedAmenityTab, setSelectedAmenityTab] = useState(0);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [editingMedia, setEditingMedia] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [customTag, setCustomTag] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    const roomID = localStorage.getItem("roomID");
    if (roomID) {
      setCurrentRoomId(roomID);
    }
  }, []);

  // Refs
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFileSubmiting, setIsFileSubmiting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);

  // All available tags for room media
  const availableRoomTags = [
    "Bed",
    "Bathroom/Washroom",
    "Room View",
    "Balcony",
    "Furniture",
    "Amenities",
    "Decor",
    "Lighting",
    "Storage",
    "Window View",
    "Others",
  ];

  const roomAmenityCategories = {
    basicFacilities: {
      title: "Basic Facilities",
      items: [
        {
          name: "Air Conditioning",
          options: [],
          Suboptions: [],
        },
        {
          name: "Wifi",
          options: [],
          Suboptions: [],
        },
        {
          name: "Television",
          options: [],
          Suboptions: [],
        },
        {
          name: "Hair Dryer",
          options: [],
          Suboptions: [],
        },
        {
          name: "Intercom",
          options: [],
          Suboptions: [],
        },
        {
          name: "Safe/Locker",
          options: [],
          Suboptions: [],
        },
        {
          name: "Geyser/Water Heater",
          options: [],
          Suboptions: [],
        },
        {
          name: "Wardrobe",
          options: [],
          Suboptions: [],
        },
        {
          name: "Charging Points",
          options: [],
          Suboptions: [],
        },
        {
          name: "Mosquito Net",
          options: [],
          Suboptions: [],
        },
        {
          name: "Kitchen",
          options: [],
          Suboptions: [],
        },
        {
          name: "Balcony/Terrace",
          options: [],
          Suboptions: [],
        },
      ],
    },
  };

  // Update local rooms when props change
  useEffect(() => {
    setLocalRooms(rooms);
  }, [rooms]);

  function getInitialRoomData() {
    return {
      numberRoom: "",
      roomName: "",
      roomSize: "",
      sizeUnit: "sqft",
      description: "",
      beds: [{ bedType: "", count: 1, accommodates: 1 }],
      FloorBedding: {
        available: false,
        count: "",
        peoplePerFloorBedding: 1, // Added as requested
      },
      alternativeBeds: [],
      occupancy: {
        baseAdults: 1,
        maximumAdults: 1,
        maximumChildren: 0,
        maximumOccupancy: 1,
      },
      bathrooms: {
        count: 1,
        private: true,
        shared: false,
      },
      mealPlan: {
        available: false,
        planType: "",
      },
      pricing: {
        baseAdultsCharge: "",
        extraFloorBeddingCharge: "",
        extraAdultsCharge: "0",
        childCharge: "0",
      },
      availability: [
        {
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1),
          )
            .toISOString()
            .split("T")[0],
          availableUnits: 1,
        },
      ],
      amenities: {
        mandatory: {},
        basicFacilities: {},
        generalServices: {},
        commonArea: {},
        foodBeverages: {},
        healthWellness: {},
        security: {},
        mediaTechnology: {},
      },
    };
  }

  // Media helper functions
  const getRoomMediaItems = (room) => {
    if (!room || !room.media) return [];
    const images = room.media.images || [];
    const videos = room.media.videos || [];
    return [...images, ...videos];
  };

  const getRoomMediaByTag = (room) => {
    const allMedia = getRoomMediaItems(room);
    const groupedMedia = {};

    allMedia.forEach((item) => {
      if (item.tags && item.tags.length > 0) {
        item.tags.forEach((tag) => {
          if (!groupedMedia[tag]) {
            groupedMedia[tag] = [];
          }
          groupedMedia[tag].push(item);
        });
      }
    });

    return groupedMedia;
  };

  const getRoomItemsWithoutTags = (room) => {
    const allMedia = getRoomMediaItems(room);
    return allMedia.filter((item) => !item.tags || item.tags.length === 0);
  };
  const calculateMaxOccupancy = (beds, floorBedding) => {
    // Formula: (bed accommodates * number of beds) + (number of gaddi * people per gaddi)
    const bedOccupancy = beds.reduce(
      (acc, bed) =>
        acc + parseInt(bed.count || 0) * parseInt(bed.accommodates || 0),
      0,
    );

    const floorOccupancy = floorBedding.available
      ? parseInt(floorBedding.count || 0) *
        parseInt(floorBedding.peoplePerFloorBedding || 1)
      : 0;

    return bedOccupancy + floorOccupancy;
  };
  // Room creation/editing functions (keeping your original logic)
  const validateRoomData = () => {
    const errors = {};

    // Basic Room Details
    if (!currentRoomData.roomName || !currentRoomData.roomName.trim()) {
      errors.roomName = "Room name is required";
    }

    if (!currentRoomData.roomSize || currentRoomData.roomSize <= 0) {
      errors.roomSize = "Valid room size is required";
    }

    if (!currentRoomData.numberRoom || currentRoomData.numberRoom <= 0) {
      errors.numberRoom = "Number of rooms must be at least 1";
    }

    // Bed Configuration Validation
    if (!currentRoomData.beds || currentRoomData.beds.length === 0) {
      errors.beds = "At least one bed configuration is required";
    } else {
      const bedErrors = [];
      currentRoomData.beds.forEach((bed, index) => {
        const bedError = {};

        if (!bed.bedType || !bed.bedType.trim()) {
          bedError.bedType = "Bed type is required";
        }

        if (!bed.count || bed.count < 1) {
          bedError.count = "Number of beds must be at least 1";
        }

        if (!bed.accommodates || bed.accommodates < 1) {
          bedError.accommodates = "Accommodates must be at least 1";
        }

        if (Object.keys(bedError).length > 0) {
          bedErrors[index] = bedError;
        }
      });

      if (bedErrors.length > 0) {
        errors.beds = bedErrors;
      }
    }

    // Floor Bedding Validation
    if (currentRoomData.FloorBedding?.available) {
      if (
        !currentRoomData.FloorBedding.count ||
        currentRoomData.FloorBedding.count < 1
      ) {
        errors.floorBedding = "Floor bedding count must be at least 1";
      }
    }

    // Occupancy Validation
    if (
      !currentRoomData.occupancy?.baseAdults ||
      currentRoomData.occupancy.baseAdults < 1
    ) {
      errors.baseAdults = "Base adults must be at least 1";
    }

    if (
      !currentRoomData.occupancy?.maximumAdults ||
      currentRoomData.occupancy.maximumAdults < 1
    ) {
      errors.maximumAdults = "Maximum adults must be at least 1";
    }

    // if (currentRoomData.occupancy?.maximumAdults < currentRoomData.occupancy?.baseAdults) {
    //   errors.maximumAdults = 'Maximum adults cannot be less than base adults';
    // }

    if (currentRoomData.occupancy?.maximumChildren < 0) {
      errors.maximumChildren = "Maximum children cannot be negative";
    }

    // Bathroom Validation
    if (
      !currentRoomData.bathrooms?.count ||
      currentRoomData.bathrooms.count < 0
    ) {
      errors.bathroomCount = "Bathroom count is required";
    }

    if (
      !currentRoomData.bathrooms?.private &&
      !currentRoomData.bathrooms?.shared
    ) {
      errors.bathroomType = "Please select either private or shared bathroom";
    }

    // Meal Plan Validation
    if (
      currentRoomData.mealPlan?.available &&
      !currentRoomData.mealPlan?.planType
    ) {
      errors.mealPlan = "Please select a meal plan type";
    }

    // Pricing Validation
    if (
      !currentRoomData.pricing?.baseAdultsCharge ||
      currentRoomData.pricing.baseAdultsCharge <= 0
    ) {
      errors.baseAdultsCharge =
        "Base price is required and must be greater than 0";
    }

    if (
      !currentRoomData.pricing?.extraFloorBeddingCharge ||
      currentRoomData.pricing.extraFloorBeddingCharge < 0
    ) {
      errors.extraFloorBeddingCharge =
        "Extra floor bedding charge cannot be negative";
    }

    // if (
    //   !currentRoomData.pricing?.childCharge ||
    //   currentRoomData.pricing.childCharge < 0
    // ) {
    //   errors.childCharge = "Child charge cannot be negative";
    // }

    // Availability Validation

    setFormErrors(errors);

    // Scroll to first error
    if (Object.keys(errors).length > 0) {
      scrollToFirstError(errors);
      return false;
    }

    return true;
  };

  console.log(formErrors, "form errors");

  // Function to scroll to the first error
  const scrollToFirstError = (errors) => {
    const errorFieldMap = {
      roomName: "roomName",
      roomSize: "roomSize",
      numberRoom: "numberRoom",
      beds: "beds",
      floorBedding: "FloorBedding",
      baseAdults: "baseAdults",
      maximumAdults: "maximumAdults",
      maximumChildren: "maximumChildren",
      bathroomCount: "bathroomCount",
      bathroomType: "bathroomType",
      mealPlan: "mealPlan",
      baseAdultsCharge: "baseAdultsCharge",
      extraFloorBeddingCharge: "extraFloorBeddingCharge",
      childCharge: "childCharge",
      availability: "availability",
    };

    // Find the first error key
    const firstErrorKey = Object.keys(errors)[0];

    // Try to find the element by various methods
    let errorElement = null;

    // Try finding by label text
    const fieldName = errorFieldMap[firstErrorKey] || firstErrorKey;
    errorElement =
      document.querySelector(`input[name="${fieldName}"]`) ||
      document.querySelector(`[name="${fieldName}"]`) ||
      document.querySelector(`label:contains("${firstErrorKey}")`);

    // If not found, try finding by error message
    if (!errorElement) {
      const errorTexts = document.querySelectorAll(
        ".MuiFormHelperText-root.Mui-error",
      );
      if (errorTexts.length > 0) {
        errorElement =
          errorTexts[0].closest(".MuiFormControl-root") || errorTexts[0];
      }
    }

    // Scroll to element
    if (errorElement) {
      errorElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Focus the input if possible
      const inputElement = errorElement.querySelector(
        "input, textarea, select",
      );
      if (inputElement) {
        setTimeout(() => inputElement.focus(), 300);
      }
    } else {
      // Fallback: scroll to top of form
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    // Show validation error message
    setValidationError("Please fill in all required fields correctly.");
  };

const handleCompleteRooms = (propertyId) => {
  // Check if there are any rooms added at all
  if (localRooms.length === 0) {
    toast.error("Please add at least one room before completing.");
    return;
  }

  // Validate that every room has at least one image
  const roomsMissingImages = localRooms.filter(room => {
    const images = room.media?.images || [];
    return images.length === 0;
  });

  if (roomsMissingImages.length > 0) {
    const missingNames = roomsMissingImages.map(r => r.roomName).join(", ");
    toast.error(`Please upload at least one image for: ${missingNames}`, {
      duration: 5000,
      icon: '📸',
    });
    return;
  }

  // If validation passes
  dispatch(completeRoomsStep(propertyId));
  onComplete?.();
};

const handleAddRoom = async () => {

    // 2. Validate basic room data
  if (!validateRoomData()) {
    toast.error("Please fill in all required fields.");
    return;
  }
  
  // 1. Validate Amenities first (The "Toast" error)
  // const amenityValidation = validateRoomAmenities();
  // if (!amenityValidation.valid) {
  //   toast.error(amenityValidation.message, {
  //     duration: 4000,
  //     position: "top-center",
  //   });
  //   return;
  // }



  setIsSubmitting(true);
  try {
    const result = await dispatch(
      addRooms({
        id: propertyId,
        data: currentRoomData,
      }),
    ).unwrap();

    // setIsComplete(true);

    if (result.room) {
      const roomID = result.room._id;
      setCurrentRoomId(roomID);

      const updatedRooms = [...localRooms, result.room];
      setLocalRooms(updatedRooms);
      onAddRoom(updatedRooms);
      
      toast.success("Room saved successfully!");

      // 3. AUTO-SCROLL TO MEDIA SECTION
      // Timeout ensures the DOM renders the media section before scrolling
      setTimeout(() => {
        const mediaSection = document.getElementById("media-upload-anchor");
        if (mediaSection) {
          mediaSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }
  } catch (error) {
    console.error("Failed to add room:", error);
    toast.error("Failed to create room. Please try again.");
  } finally {
    setIsSubmitting(false);
    // Note: You might want to keep isSubmitting true if you want to 
    // keep the upload buttons active as per your previous logic
  }
};

  // Media upload functions
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);

    setValidationError("");
    if (files.length > 20) {
      setValidationError("You can upload maximum 20 files at once");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("media", file);
    });

    setIsFileSubmiting(true);
    try {
      const result = await dispatch(
        uploadRoomMedia({
          propertyId,
          roomId: currentRoomId,
          formData,
        }),
      ).unwrap();

      setCurrentRoomData(result.room);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.log(error.message);
      console.error("Upload failed:", error);

      // Handle validation errors from the response
      if (error.invalidFiles && error.invalidFiles.length > 0) {
        // Create a user-friendly error message from invalidFiles
        const fileErrors = error.invalidFiles
          .map((file) => `${file.filename}: ${file.error}`)
          .join("\n");

        setValidationError(`Upload failed:\n${fileErrors}`);
      } else {
        // Fallback error message
        setValidationError(
          error.message || "Failed to upload media. Please try again.",
        );
      }
    } finally {
      setIsFileSubmiting(false);
    }
  };
  const handleDeleteMedia = async (mediaId) => {
    if (
      !currentRoomId ||
      !window.confirm("Are you sure you want to delete this media item?")
    )
      return;

    try {
      await dispatch(
        deleteRoomMediaItem({
          propertyId,
          roomId: currentRoomId,
          mediaId,
        }),
      ).unwrap();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleEditMedia = (mediaItem) => {
    setEditingMedia({
      ...mediaItem,
      roomId: currentRoomId,
      tags: mediaItem.tags || [],
    });
    setEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMedia || !editingMedia.tags || editingMedia.tags.length === 0) {
      alert("Please select at least one tag before saving.");
      return;
    }

    try {
      const result = await dispatch(
        updateRoomMediaItem({
          propertyId,
          roomId: currentRoomId,
          mediaId: editingMedia._id,
          data: {
            tags: editingMedia.tags,
            isCover: editingMedia.isCover,
            displayOrder: editingMedia.displayOrder,
          },
        }),
      ).unwrap();

      setCurrentRoomData(result.room);

      setEditDialog(false);
      setEditingMedia(null);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };



//   const validateRoomAmenities = () => {
//   const categories = roomAmenityCategories;
//   const roomAmenities = currentRoomData.amenities;
  
//   for (const [catKey, category] of Object.entries(categories)) {
//     for (const item of category.items) {
//       const sanitizedKey = item.name.replace(/[^a-zA-Z0-9]/g, '');
//       const savedValue = roomAmenities?.[catKey]?.[sanitizedKey];

//       // Check if 'available' is specifically true or false
//       if (savedValue?.available === undefined) {
//         return {
//           valid: false,
//           message: `Please select Yes or No for ${item.name} in ${category.title}`,
//           categoryKey: catKey
//         };
//       }
//     }
//   }
//   return { valid: true };
// };


const isAmenitiesComplete = () => {
  return Object.entries(roomAmenityCategories).every(([catKey, category]) => 
    category.items.every(item => {
      const key = item.name.replace(/[^a-zA-Z0-9]/g, '');
      return currentRoomData.amenities?.[catKey]?.[key]?.available !== undefined;
    })
  );
};

  const handleTagToggle = (tag) => {
    if (!editingMedia) return;

    const currentTags = editingMedia.tags || [];
    const isSelected = currentTags.includes(tag);

    if (isSelected) {
      setEditingMedia((prev) => ({
        ...prev,
        tags: prev.tags.filter((t) => t !== tag),
      }));
    } else {
      setEditingMedia((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const handleUpdateRoom = async () => {
    if (!validateRoomData()) return;

    try {
      const roomToUpdate = localRooms[editingRoomIndex];
      const roomId = roomToUpdate._id || roomToUpdate.id;

      const result = await dispatch(
        updateRoom({
          id: propertyId,
          roomId: roomId,
          data: currentRoomData,
        }),
      ).unwrap();
      setIsComplete(true);
      if (result.type.endsWith("/fulfilled")) {
        console.log("in the condition....");
        const updatedRooms = [...localRooms];
        updatedRooms[editingRoomIndex] = currentRoomData;
        setLocalRooms(updatedRooms);
        onAddRoom(updatedRooms);

        setIsEditingRoom(false);
        setEditingRoomIndex(-1);
        setCurrentRoomData(getInitialRoomData());
        setFormErrors({});
      }
    } catch (error) {
      console.error("Failed to update room:", error);
    }
  };

  const handleDeleteRoom = async (index) => {
    const roomToDelete = localRooms[index];
    const roomId = roomToDelete._id || roomToDelete.id;

    if (roomId && propertyId) {
      try {
        const result = await dispatch(
          deleteRoom({
            propertyId,
            roomId,
          }),
        ).unwrap();

        setLocalRooms(result.property.rooms);
        console.log(localRooms, "handle Room delete clicked ");
        onAddRoom(result.property.rooms);
      } catch (error) {
        console.error("Failed to delete room:", error);
      }
    } else {
      const updatedRooms = localRooms.filter((_, i) => i !== index);
      setLocalRooms(updatedRooms);
      onAddRoom(updatedRooms);
    }
  };

  const handleEditRoom = (index) => {
    const roomToEdit = localRooms[index];
    setCurrentRoomId(roomToEdit._id || roomToEdit.id);

    // Deep clone the object to break references and handle Mongoose Maps
    const sanitizedRoomData = JSON.parse(JSON.stringify(roomToEdit));

    setCurrentRoomData({
      ...getInitialRoomData(),
      ...sanitizedRoomData,
      // Ensure amenities object exists with all required categories
      amenities: {
        ...getInitialRoomData().amenities,
        ...(sanitizedRoomData.amenities || {}),
      },
    });

    setEditingRoomIndex(index);
    setIsEditingRoom(true);
    setIsAddingRoom(true);
    setIsComplete(false);
  };

  const handleCancelForm = () => {
    setIsAddingRoom(false);
    setIsEditingRoom(false);
    setIsComplete(false);
    setEditingRoomIndex(-1);
    setCurrentRoomData(getInitialRoomData());
    setFormErrors({});
    setSelectedAmenityTab(0);
    setCurrentRoomId(null);
    setValidationError("");
  };

const handleAddNewForm = () => {
    setIsAddingRoom(false);
    setIsEditingRoom(false);
    // Ensure this is false so the UI doesn't think the whole process is over
    setIsComplete(false); 
    setEditingRoomIndex(-1);
    setCurrentRoomData(getInitialRoomData());
    setFormErrors({});
    setSelectedAmenityTab(0);
    setCurrentRoomId(null);
    setValidationError("");

    setTimeout(() => {
      setIsAddingRoom(true);
    }, 100); // Reduced delay for snappier UX
};

  // Tag Group Card Component
  const TagGroupCard = ({ tag, mediaItems }) => {
    const firstImage = mediaItems[0];
    const imageCount = mediaItems.filter(
      (item) => item.type === "image",
    ).length;
    const videoCount = mediaItems.filter(
      (item) => item.type === "video",
    ).length;

    return (
      <Card
        sx={{
          width: 280,
          height: 200,
          position: "relative",
          cursor: "pointer",
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          overflow: "hidden",
          "&:hover": {
            transform: "scale(1.02)",
            transition: "transform 0.2s ease-in-out",
            boxShadow: 3,
          },
        }}
      >
        {firstImage.type === "image" ? (
          <CardMedia
            component="img"
            image={`${firstImage.url}`}
            alt={firstImage.filename}
            sx={{ width: "100%", height: "70%", objectFit: "cover" }}
          />
        ) : (
          <video
            src={`${firstImage.url}`}
            style={{ width: "100%", height: "70%", objectFit: "cover" }}
            muted
            loop
            autoPlay
            preload="metadata"
          />
        )}

        <CardContent sx={{ height: "30%", p: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            {tag}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            {imageCount > 0 && (
              <Chip
                label={`${imageCount} Images`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {videoCount > 0 && (
              <Chip
                label={`${videoCount} Videos`}
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>
        </CardContent>

        <Badge
          badgeContent={mediaItems.length}
          color="primary"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            "& .MuiBadge-badge": {
              fontSize: "0.75rem",
              minWidth: 20,
              height: 20,
            },
          }}
        />
      </Card>
    );
  };

  // Render media upload step
  const renderMediaUploadStep = () => {
    const currentRoom = currentRoomData;
    if (!currentRoom) return null;

    const groupedMedia = getRoomMediaByTag(currentRoom);
    const untaggedItems = getRoomItemsWithoutTags(currentRoom);
    const totalMedia = getRoomMediaItems(currentRoom);

    return (
      <Box>
        <div id="media-upload-anchor" style={{ marginTop: "-100px", paddingTop: "100px" }}> 
          <Typography variant="h5" gutterBottom>
          Upload Media for {currentRoom.roomName}
        </Typography>
        </div>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Upload photos and videos for this room. Each media item must have at
          least one tag.
        </Typography>

        {validationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationError}
          </Alert>
        )}

        {/* Upload Section */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div></div>
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={() => fileInputRef.current?.click()}
              disabled={!isSubmitting && !isEditingRoom}
            >
              {console.log(isEditingRoom, "isEdting room")}
              {!isSubmitting
                ? isEditingRoom
                  ? "Upload Files"
                  : "Save Room to upload media"
                : isEditingRoom
                  ? "Upload Files"
                  : isFileSubmiting
                    ? "Uploading..."
                    : "Upload Files"}
            </Button>
          </Box>
        </Box>

        {isFileSubmiting && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Uploading files...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {/* Tagged Media Groups */}
        {Object.keys(groupedMedia).length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Media by Tags
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(groupedMedia).map(([tag, mediaItems]) => (
                <Grid item key={tag}>
                  <TagGroupCard tag={tag} mediaItems={mediaItems} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Untagged Media */}
        {untaggedItems.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="error">
              Untagged Media ({untaggedItems.length})
            </Typography>
            <Grid container spacing={2}>
              {untaggedItems.map((mediaItem) => (
                <Grid item key={mediaItem._id}>
                  <Card
                    sx={{
                      width: 200,
                      height: 150,
                      position: "relative",
                      cursor: "pointer",
                      border: "2px solid #f44336",
                      borderRadius: 2,
                      overflow: "hidden",
                      "&:hover": {
                        transform: "scale(1.02)",
                        transition: "transform 0.2s ease-in-out",
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => handleEditMedia(mediaItem)}
                  >
                    {mediaItem.type === "image" ? (
                      <CardMedia
                        component="img"
                        image={`${mediaItem.url}`}
                        alt={mediaItem.filename}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <video
                        src={`${mediaItem.url}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        muted
                        loop
                        autoPlay
                        preload="metadata"
                      />
                    )}
                    <Chip
                      label="Needs Tags"
                      color="error"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        fontSize: "0.7rem",
                        height: 20,
                      }}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Status Alerts */}
        {totalMedia.length === 0 && (
          <Alert severity="info">
            No media uploaded for this room yet. Upload some photos and videos
            to showcase this room.
          </Alert>
        )}

        {untaggedItems.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {untaggedItems.length} media item(s) need tags. Click on items with
            red borders to add tags.
          </Alert>
        )}
      </Box>
    );
  };

  const bedTypes = [
    "Single Bed",
    "Double Bed",
    "Queen Bed",
    "King Bed",
    "Bunk Bed",
    "Sofa Bed",
    "Couch",
    "Floor Mattress",
    "Air Mattress",
    "Crib",
  ];

  const handleRoomChange = (field, value) => {
    setCurrentRoomData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBathroomTypeChange = (type, checked) => {
    if (checked) {
      // If checking one, uncheck the other
      setCurrentRoomData((prev) => ({
        ...prev,
        bathrooms: {
          ...prev.bathrooms,
          private: type === "private",
          shared: type === "shared",
        },
      }));
    }
    // If unchecking, we don't allow it (at least one must be selected)
  };

  const handleNestedChange = (section, field, value) => {
    setCurrentRoomData((prev) => {
      const updatedSection = { ...prev[section], [field]: value };
      const updatedRoom = { ...prev, [section]: updatedSection };

      // Recalculate occupancy if floor bedding changes
      if (section === "FloorBedding") {
        updatedRoom.occupancy.maximumOccupancy = calculateMaxOccupancy(
          updatedRoom.beds,
          updatedSection,
        );
      }
      return updatedRoom;
    });
  };

  const handleBedChange = (index, field, value) => {
    setCurrentRoomData((prev) => {
      const updatedBeds = [...prev.beds];
      updatedBeds[index] = { ...updatedBeds[index], [field]: value };
      return {
        ...prev,
        beds: updatedBeds,
        occupancy: {
          ...prev.occupancy,
          maximumOccupancy: calculateMaxOccupancy(
            updatedBeds,
            prev.FloorBedding,
          ), // Recalculate
        },
      };
    });
  };

  const handleRoomAmenityChange = (category, amenityName, updates) => {
    const key = amenityName.replace(/[^a-zA-Z0-9]/g, "");

    setCurrentRoomData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [category]: {
          ...prev.amenities[category],
          [key]: updates,
        },
      },
    }));
  };

  
  const addBed = () => {
    setCurrentRoomData((prev) => ({
      ...prev,
      beds: [...prev.beds, { bedType: "", count: 1, accommodates: 1 }],
    }));
  };

  const removeBed = (index) => {
    if (currentRoomData.beds.length <= 1) return;

    const updatedBeds = currentRoomData.beds.filter((_, i) => i !== index);

    setCurrentRoomData((prev) => ({
      ...prev,
      beds: updatedBeds,
      // No occupancy update needed here anymore
    }));
  };

  const handleDuplicateRoom = async (index) => {
    if (
      !window.confirm(
        "Do you want to duplicate this room? Media will not be copied.",
      )
    ) {
      return;
    }
    const roomToDuplicate = localRooms[index];

    // Create a deep copy of the room data, excluding the _id and media
    const duplicatedRoomData = {
      ...roomToDuplicate,
      roomName: `${roomToDuplicate.roomName} (Copy)`,
      numberRoom: roomToDuplicate.numberRoom,
      roomSize: roomToDuplicate.roomSize,
      sizeUnit: roomToDuplicate.sizeUnit,
      description: roomToDuplicate.description,
      beds: [...roomToDuplicate.beds],
      FloorBedding: { ...roomToDuplicate.FloorBedding },
      alternativeBeds: [...(roomToDuplicate.alternativeBeds || [])],
      occupancy: { ...roomToDuplicate.occupancy },
      bathrooms: { ...roomToDuplicate.bathrooms },
      mealPlan: { ...roomToDuplicate.mealPlan },
      pricing: { ...roomToDuplicate.pricing },
      availability: roomToDuplicate.availability.map((avail) => ({ ...avail })),
      amenities: JSON.parse(JSON.stringify(roomToDuplicate.amenities)), // Deep copy
    };

    // Remove fields that shouldn't be duplicated
    delete duplicatedRoomData._id;
    delete duplicatedRoomData.id;
    delete duplicatedRoomData.media;
    delete duplicatedRoomData.createdAt;
    delete duplicatedRoomData.updatedAt;

    setIsSubmitting(true);

    try {
      const result = await dispatch(
        addRooms({
          id: propertyId,
          data: duplicatedRoomData,
        }),
      ).unwrap();

      if (result.room) {
        // Update local rooms
        const updatedRooms = [...localRooms, result.room];
        setLocalRooms(updatedRooms);
        onAddRoom(updatedRooms);

        // Optionally show success message
        setValidationError("");
      }
    } catch (error) {
      console.error("Failed to duplicate room:", error);
      setValidationError("Failed to duplicate room. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Main render logic
  if (isAddingRoom) {
    // Room details step - render your existing room form here
    return (
      <Paper className="p-4 mb-4">
        <Typography variant="h6" gutterBottom>
          {isEditingRoom ? "Edit Room" : "Add New Room"}
        </Typography>

        {/* Edit Media Dialog */}
        <Dialog
          open={editDialog}
          onClose={() => setEditDialog(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Edit Media Tags</DialogTitle>
          <DialogContent>
            {editingMedia && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  {editingMedia.type === "image" ? (
                    <img
                      src={`${editingMedia.url}`}
                      alt={editingMedia.filename}
                      style={{
                        width: "100%",
                        height: "400px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    <video
                      src={`${editingMedia.url}`}
                      style={{
                        width: "100%",
                        height: "400px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                      controls
                    />
                  )}
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleDeleteMedia(editingMedia._id)}
                  >
                    Delete
                  </Button>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Tags Added
                  </Typography>

                  <Box
                    sx={{
                      mb: 2,
                      minHeight: 60,
                      border: `1px solid ${!editingMedia.tags || editingMedia.tags.length === 0 ? "#f44336" : "#e0e0e0"}`,
                      borderRadius: 1,
                      p: 2,
                      bgcolor: "#f9f9f9",
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    {editingMedia.tags.length > 0 ? (
                      editingMedia.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          onDelete={() => {
                            setEditingMedia((prev) => ({
                              ...prev,
                              tags: prev.tags.filter((t) => t !== tag),
                            }));
                          }}
                          deleteIcon={<Close />}
                          color="primary"
                          variant="outlined"
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No tags selected
                      </Typography>
                    )}
                  </Box>

                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add Custom Tag"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (
                        e.key === "Enter" &&
                        customTag.trim() &&
                        !editingMedia.tags.includes(customTag.trim())
                      ) {
                        setEditingMedia((prev) => ({
                          ...prev,
                          tags: [...prev.tags, customTag.trim()],
                        }));
                        setCustomTag("");
                      }
                    }}
                    sx={{ mb: 2 }}
                  />

                  <Box
                    sx={{
                      maxHeight: 300,
                      overflow: "auto",
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                    }}
                  >
                    <List>
                      {availableRoomTags.map((tag) => (
                        <ListItem
                          key={tag}
                          dense
                          button
                          onClick={() => handleTagToggle(tag)}
                        >
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={editingMedia.tags.includes(tag)}
                              size="small"
                            />
                          </ListItemIcon>
                          <ListItemText primary={tag} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setEditDialog(false);
              }}
            >
              Back
            </Button>
            <Button
              onClick={handleSaveEdit}
              variant="contained"
              disabled={!editingMedia?.tags || editingMedia.tags.length === 0}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Tag Group Dialog - Add your existing tag group dialog here */}

        <Grid container spacing={3}>
          {/* Basic Room Details - Same as before */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <TextField
              name="roomName"
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
              fullWidth
              label="Room Name *"
              value={currentRoomData.roomName}
              onChange={(e) => handleRoomChange("roomName", e.target.value)}
              error={!!formErrors.roomName}
              helperText={formErrors.roomName}
              className="mb-4"
            />

            <Grid container spacing={2}>
              <Grid item size={{ xs: 8 }}>
                <TextField
                  name="roomSize"
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
                    marginTop: "10px",
                  }}
                  fullWidth
                  label="Room Size *"
                  type="number"
                  slotProps={{
                    htmlInput: {
                      onWheel: (e) => e.currentTarget.blur(),
                    },
                  }}
                  value={currentRoomData.roomSize}
                  onChange={(e) => handleRoomChange("roomSize", e.target.value)}
                  error={!!formErrors.roomSize}
                  helperText={formErrors.roomSize}
                />
              </Grid>
              <Grid item xs={4}>
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
                    marginTop: "10px",
                  }}
                  fullWidth
                >
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={currentRoomData.sizeUnit}
                    onChange={(e) =>
                      handleRoomChange("sizeUnit", e.target.value)
                    }
                    label="Unit"
                  >
                    <MenuItem value="sqft">sq ft</MenuItem>
                    <MenuItem value="sqm">sq m</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          <Grid item size={{ xs: 12, md: 6 }}>
            <TextField
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
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={currentRoomData.description}
              onChange={(e) => handleRoomChange("description", e.target.value)}
              className="mb-4"
            />
          </Grid>

          {/* Bed Configuration - Same as before */}
          <Grid item size={{ xs: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              Bed Configuration *
            </Typography>

            {currentRoomData.beds.map((bed, index) => (
              <Grid
                container
                spacing={2}
                key={index}
                className="mb-3 items-end"
              >
                <Grid item size={{ xs: 12 }} sm={4}>
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
                    fullWidth
                    error={!!formErrors.beds?.[index]?.bedType}
                  >
                    <InputLabel>Bed Type *</InputLabel>
                    <Select
                      name="beds"
                      value={bed.bedType}
                      onChange={(e) =>
                        handleBedChange(index, "bedType", e.target.value)
                      }
                      label="Bed Type *"
                    >
                      {bedTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.beds?.[index]?.bedType && (
                      <FormHelperText>
                        {formErrors.beds[index].bedType}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item size={{ xs: 12, md: 3 }}>
                  <TextField
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
                    name="beds"
                    fullWidth
                    label="Number of Beds(of this type) *"
                    type="number"
                    slotProps={{
                      htmlInput: {
                        onWheel: (e) => e.currentTarget.blur(),
                      },
                    }}
                    value={bed.count}
                    onChange={(e) =>
                      handleBedChange(index, "count", parseInt(e.target.value))
                    }
                    error={!!formErrors.beds?.[index]?.count}
                    helperText={formErrors.beds?.[index]?.count}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>

                <Grid item size={{ xs: 12, md: 3 }}>
                  <TextField
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
                    fullWidth
                    label="Accommodates *"
                    type="number"
                    slotProps={{
                      htmlInput: {
                        onWheel: (e) => e.currentTarget.blur(),
                      },
                    }}
                    value={bed.accommodates}
                    onChange={(e) =>
                      handleBedChange(
                        index,
                        "accommodates",
                        parseInt(e.target.value),
                      )
                    }
                    error={!!formErrors.beds?.[index]?.accommodates}
                    helperText={formErrors.beds?.[index]?.accommodates}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>

                <Grid
                  item
                  size={{ xs: 12 }}
                  sm={2}
                  className="flex justify-end"
                >
                  <IconButton
                    color="error"
                    onClick={() => removeBed(index)}
                    disabled={currentRoomData.beds.length <= 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={addBed}
              className="mt-2"
            >
              Add Another Bed
            </Button>
          </Grid>

          {/* Bed Configuration - Same as before */}
          <Grid item size={{ xs: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              Number of rooms (of this type) *
            </Typography>

            <Grid item size={{ xs: 4 }}>
              <TextField
                name="numberRoom"
                label="Number of rooms (of this type) *"
                type="number"
                fullWidth
                value={currentRoomData.numberRoom}
                onChange={(e) => handleRoomChange("numberRoom", e.target.value)}
                error={!!formErrors.numberRoom}
                helperText={formErrors.numberRoom}
                slotProps={{
                  htmlInput: {
                    onWheel: (e) => e.currentTarget.blur(),
                  },
                }}
                sx={{
                  marginTop: "10px",
                  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                    {
                      display: "none",
                      appearance: "none",
                      margin: 0,
                    },
                  "& input[type=number]": {
                    MozAppearance: "textfield",
                  },
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
              />
            </Grid>
          </Grid>

          <FormControlLabel
            control={
              <Checkbox
                checked={currentRoomData.FloorBedding.available}
                onChange={(e) =>
                  handleNestedChange(
                    "FloorBedding",
                    "available",
                    e.target.checked,
                  )
                }
              />
            }
            label="Floor Bedding (Gaddi)"
          />

          {currentRoomData.FloorBedding.available && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  label="Number of Gaddi"
                  type="number"
                  slotProps={{
                    htmlInput: {
                      onWheel: (e) => e.currentTarget.blur(),
                    },
                  }}
                  value={currentRoomData.FloorBedding.count}
                  onChange={(e) =>
                    handleNestedChange(
                      "FloorBedding",
                      "count",
                      parseInt(e.target.value),
                    )
                  }
                />
              </Grid>
              {/* NEW BOX: People per floor bedding */}
              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  label="People per Gaddi *"
                  type="number"
                  slotProps={{
                    htmlInput: {
                      onWheel: (e) => e.currentTarget.blur(),
                    },
                  }}
                  value={currentRoomData.FloorBedding.peoplePerFloorBedding}
                  onChange={(e) =>
                    handleNestedChange(
                      "FloorBedding",
                      "peoplePerFloorBedding",
                      parseInt(e.target.value),
                    )
                  }
                  error={!!formErrors.peoplePerFloorBedding}
                />
              </Grid>
            </Grid>
          )}

          {/* Occupancy, Bathroom, Meal Plan sections - Same as before */}
          <Grid item size={{ xs: 12 }}>
            <Divider className="my-3" />
            <Typography
              sx={{ marginTop: "5px" }}
              variant="subtitle1"
              gutterBottom
            >
              Occupancy
            </Typography>

            <Grid container spacing={3}>
              <Grid sx={{ marginTop: "10px" }} item size={{ xs: 12, md: 6 }}>
                <TextField
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
                  fullWidth
                  label="Base Adults *"
                  type="number"
                  slotProps={{
                    htmlInput: {
                      onWheel: (e) => e.currentTarget.blur(),
                    },
                  }}
                  value={currentRoomData.occupancy?.baseAdults}
                  onChange={(e) =>
                    handleNestedChange(
                      "occupancy",
                      "baseAdults",
                      parseInt(e.target.value),
                    )
                  }
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>

              {/* <Grid item size={{ xs: 12, md: 6 }}> */}
              {/* <TextField sx={{
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
                  fullWidth
                  label="Maximum Adults *"
                  type="number"
                    slotProps={{
                      htmlInput: {
                        onWheel: (e) => e.currentTarget.blur(),
                      },
                    }}
                  value={currentRoomData.occupancy.maximumAdults}
                  onChange={(e) => handleNestedChange('occupancy', 'maximumAdults', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 1 } }}
                /> */}
              {/* </Grid> */}

              {/* <Grid item size={{ xs: 12, md: 6 }}> */}
              {/* <TextField sx={{
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
                  fullWidth
                  label="Maximum Children"
                  type="number"
                    slotProps={{
                      htmlInput: {
                        onWheel: (e) => e.currentTarget.blur(),
                      },
                    }}
                  value={currentRoomData.occupancy?.maximumChildren}
                  onChange={(e) => handleNestedChange('occupancy', 'maximumChildren', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 0 } }}
                /> */}
              {/* </Grid> */}

              <Grid item size={{ xs: 12, md: 6 }} sx={{ marginTop: "10px" }}>
                <TextField
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
                  fullWidth
                  label="Maximum Occupancy"
                  type="number"
                  slotProps={{
                    htmlInput: {
                      onWheel: (e) => e.currentTarget.blur(),
                    },
                  }}
                  value={currentRoomData.occupancy?.maximumOccupancy}
                  InputProps={{ readOnly: true }}
                  helperText=""
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Bathroom */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" gutterBottom>
              Bathroom
            </Typography>

            <Grid container spacing={2}>
              <Grid sx={{ marginTop: "10px" }} item xs={6}>
                <TextField
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
                  fullWidth
                  label="Bathroom Count *"
                  type="number"
                  slotProps={{
                    htmlInput: {
                      onWheel: (e) => e.currentTarget.blur(),
                    },
                  }}
                  value={currentRoomData.bathrooms.count}
                  onChange={(e) =>
                    handleNestedChange(
                      "bathrooms",
                      "count",
                      parseInt(e.target.value),
                    )
                  }
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>

              <Grid item xs={6}>
                <Box display="flex" gap={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={currentRoomData.bathrooms.private}
                        onChange={(e) =>
                          handleBathroomTypeChange("private", e.target.checked)
                        }
                      />
                    }
                    label="Private Bathroom"
                  />
                  {formErrors.bathroomType && (
                    <FormHelperText error>
                      {formErrors.bathroomType}
                    </FormHelperText>
                  )}

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={currentRoomData.bathrooms.shared}
                        onChange={(e) =>
                          handleBathroomTypeChange("shared", e.target.checked)
                        }
                      />
                    }
                    label="Shared Bathroom"
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Meal Plan */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" gutterBottom>
              Meal Plan
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={currentRoomData.mealPlan.available}
                  onChange={(e) =>
                    handleNestedChange(
                      "mealPlan",
                      "available",
                      e.target.checked,
                    )
                  }
                />
              }
              label="Meal Plan Available"
            />
            {formErrors.mealPlan && (
              <FormHelperText error>{formErrors.mealPlan}</FormHelperText>
            )}

            {currentRoomData.mealPlan.available && (
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
                fullWidth
              >
                <InputLabel>Meal</InputLabel>
                <Select
                  value={currentRoomData.mealPlan.planType}
                  onChange={(e) =>
                    handleNestedChange("mealPlan", "planType", e.target.value)
                  }
                  label="Plan Type"
                >
                  <MenuItem value="Accommodation only">
                    Accommodation only
                  </MenuItem>
                  <MenuItem value="Free Breakfast">Free Breakfast</MenuItem>
                  <MenuItem value="Free Breakfast + Lunch">
                    Free Breakfast + Lunch
                  </MenuItem>
                  <MenuItem value="Free Breakfast + Dinner">
                    Free Breakfast + Dinner{" "}
                  </MenuItem>
                  <MenuItem value="Free Lunch">Free Lunch</MenuItem>
                  <MenuItem value="Free Dinner">Free Dinner</MenuItem>
                  <MenuItem value="Free Lunch + Dinner">
                    Free Lunch + Dinner{" "}
                  </MenuItem>
                  <MenuItem value="Free Breakfast + Lunch + Dinner">
                    Free Breakfast + Lunch + Dinner{" "}
                  </MenuItem>
                </Select>
              </FormControl>
            )}
          </Grid>

          {/* Pricing */}
          <Grid item size={{ xs: 12 }}>
            <Divider className="my-3" />
            <Typography
              sx={{ marginTop: "10px" }}
              variant="subtitle1"
              gutterBottom
            >
              Pricing
            </Typography>

            <Grid container spacing={3}>
              <Grid sx={{ marginTop: "10px" }} item size={{ xs: 12 }} md={4}>
                <TextField
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
                  name="baseAdultsCharge"
                  fullWidth
                  label="Base Price (per night) *"
                  type="number"
                  slotProps={{
                    htmlInput: {
                      onWheel: (e) => e.currentTarget.blur(),
                    },
                  }}
                  value={currentRoomData.pricing?.baseAdultsCharge}
                  onChange={(e) =>
                    handleNestedChange(
                      "pricing",
                      "baseAdultsCharge",
                      parseFloat(e.target.value),
                    )
                  }
                  error={!!formErrors.baseAdultsCharge}
                  helperText={formErrors.baseAdultsCharge}
                  InputProps={{ startAdornment: "₹" }}
                />
              </Grid>

              <Grid item size={{ xs: 12 }} md={4}>
                <TextField
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
                  name="extraFloorBeddingCharge"
                  fullWidth
                  label="Extra Floor Bedding (Gaddi) Charge"
                  type="number"
                  slotProps={{
                    htmlInput: {
                      onWheel: (e) => e.currentTarget.blur(),
                    },
                  }}
                  value={currentRoomData.pricing?.extraFloorBeddingCharge}
                  onChange={(e) =>
                    handleNestedChange(
                      "pricing",
                      "extraFloorBeddingCharge",
                      parseFloat(e.target.value),
                    )
                  }
                  InputProps={{ startAdornment: "₹" }}
                  error={!!formErrors.extraFloorBeddingCharge}
                  helperText={formErrors.extraFloorBeddingCharge}
                />
              </Grid>

              {/* <Grid item size={{ xs: 12 }} md={4}>
                <TextField sx={{
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
                name='childCharge'
                  fullWidth
                  label="Child Charge"
                  type="number"
                    slotProps={{
                      htmlInput: {
                        onWheel: (e) => e.currentTarget.blur(),
                      },
                    }}
                  value={currentRoomData.pricing?.childCharge}
                  onChange={(e) => handleNestedChange('pricing', 'childCharge', parseFloat(e.target.value))}
                  InputProps={{ startAdornment: '₹' }}
                  error={!!formErrors.childCharge}
                  helperText={formErrors.childCharge}
                />
              </Grid> */}
            </Grid>
          </Grid>
        </Grid>

        

        {/* Room Amenities */}
        <RoomsAmenities
          roomAmenityCategories={roomAmenityCategories}
          currentRoomData={currentRoomData}
          selectedAmenityTab={selectedAmenityTab}
          setSelectedAmenityTab={setSelectedAmenityTab}
          handleRoomAmenityChange={handleRoomAmenityChange}
        />

        <div className="flex justify-end mt-4 gap-2">
          <Button
            variant="outlined"
            onClick={() => {
              handleCancelForm();
            }}
          >
            Back
          </Button>

         <Button
  variant="contained"
  color="primary"
  disabled={isSubmitting}
  onClick={isEditingRoom ? handleUpdateRoom : handleAddRoom}
>
  {isEditingRoom ? 'Update Room' : 'Save Room'}
</Button>

          {/* <Button
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            onClick={isEditingRoom ? handleUpdateRoom : handleAddRoom}
          >
            {isEditingRoom ? "Update Room" : "Save Room"}
          </Button> */}
        </div>

        <div id="media-upload-section" className="my-5">{renderMediaUploadStep()}</div>

        {!isEditingRoom && (
          <div className="flex justify-end mt-4 gap-2">
            <Button
              variant="outlined"
              onClick={() => {
                handleAddNewForm();
              }}
            >
              Add New Room
            </Button>

            <Button
              variant="contained"
              color="primary"
              disabled={localRooms.length == 0}
              onClick={() => {
                handleCompleteRooms(propertyId)
              }}
            >
              Next
            </Button>
          </div>
        )}
      </Paper>
    );
  }

  // Room list view - your existing room list JSX
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Property Rooms
      </Typography>

      <div className="mb-6">
        <Grid container spacing={3}>
          {localRooms.map((room, index) => (
            <Grid item size={{ xs: 12, md: 6 }} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <Typography variant="h6">{room.roomName}</Typography>
                    <div className="flex gap-1">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditRoom(index)}
                        title="Edit Room"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleDuplicateRoom(index)}
                        disabled={isSubmitting}
                        title="Duplicate Room"
                      >
                        <ContentCopy />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteRoom(index)}
                        title="Delete Room"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </div>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {room.roomSize} {room.sizeUnit}
                  </Typography>

                  {room.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {room.description}
                    </Typography>
                  )}

                  <Divider className="my-2" />

                  <div className="space-y-1">
                    <Typography variant="body2">
                      <strong>Beds:</strong>{" "}
                      {room.beds
                        ?.map(
                          (bed) =>
                            `${bed.count}x ${bed.bedType} (${bed.accommodates} guests)`,
                        )
                        .join(", ")}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Occupancy:</strong> {room.occupancy?.baseAdults}{" "}
                      adults
                      {room.occupancy?.maximumChildren > 0 &&
                        `, up to ${room.occupancy.maximumChildren} children`}
                      {` (max ${room.occupancy?.maximumOccupancy} total)`}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Bathroom:</strong> {room.bathrooms.count}
                      {room.bathrooms.private ? " private" : " shared"}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Price:</strong> ₹{room.pricing?.baseAdultsCharge}{" "}
                      per night
                    </Typography>

                    <Typography variant="body2">
                      <strong>Availability:</strong>{" "}
                      {room.availability?.length || 0} period(s)
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>

      <div className="flex justify-between">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddingRoom(true)}
          sx={{ mt: 2 }}
        >
          Add Room
        </Button>
        <Button
          disabled={localRooms.length == 0}
          variant="contained"
          onClick={() => {
            handleCompleteRooms(propertyId)
          }}
          sx={{ mt: 2 }}
        >
          Complete Room
        </Button>
      </div>
    </Box>
  );
}

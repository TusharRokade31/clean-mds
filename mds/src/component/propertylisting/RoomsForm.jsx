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
  Box,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Alert,
} from "@mui/material";

import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Image as ImageIcon,
  ContentCopy,
} from "@mui/icons-material";
import { useDispatch } from "react-redux";
import {
  addRooms,
  deleteRoom,
  updateRoom,
  completeRoomsStep,
} from "@/redux/features/property/propertySlice";
import RoomsAmenities from "./RoomsAmenities";
import toast from "react-hot-toast";
import { useConfirm } from "@/hooks/useConfirm";
import SingleRoomMediaForm from "./SingleRoomMediaForm";


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
  const { confirm, ConfirmDialog } = useConfirm();

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
          bedError.accommodates = "People per bed must be at least 1";
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
      // if (
      //   !currentRoomData.FloorBedding.count ||
      //   currentRoomData.FloorBedding.count < 1
      // ) {
      //   errors.floorBedding = "Floor bedding count must be at least 1";
      // }
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

    // if (
    //   !currentRoomData.pricing?.extraFloorBeddingCharge ||
    //   currentRoomData.pricing.extraFloorBeddingCharge < 0
    // ) {
    //   errors.extraFloorBeddingCharge =
    //     "Extra floor bedding charge cannot be negative";
    // }

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




const isAmenitiesComplete = () => {
  return Object.entries(roomAmenityCategories).every(([catKey, category]) => 
    category.items.every(item => {
      const key = item.name.replace(/[^a-zA-Z0-9]/g, '');
      return currentRoomData.amenities?.[catKey]?.[key]?.available !== undefined;
    })
  );
};


  const handleDeleteRoom = async (index) => {
     const ok = await confirm({
    title: 'Delete Room?',
    description: 'This action cannot be undone.',
    confirmText: 'Delete',
    confirmColor: 'error',
  });
  if (!ok) return;
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
     setIsSubmitting(false); // Re-enable the Save button for the new room
    setIsAddingRoom(false);
    setIsEditingRoom(false);
    setIsComplete(false); 
    setEditingRoomIndex(-1);
    setCurrentRoomData(getInitialRoomData());
    setFormErrors({});
    setSelectedAmenityTab(0);
    setCurrentRoomId(null);
    setValidationError("");
    setValidationError("");

    setTimeout(() => {
      setIsAddingRoom(true);
    }, 100); // Reduced delay for snappier UX
};


const handleAddRoom = async () => {
  if (!validateRoomData()) {
    toast.error("Please fill in all required fields.");
    return;
  }

  setIsSubmitting(true);
  try {
    const result = await dispatch(
      addRooms({ id: propertyId, data: currentRoomData })
    ).unwrap();

    if (result.room) {
      const roomID = result.room._id;
      setCurrentRoomId(roomID);
      const updatedRooms = [...localRooms, result.room];
      setLocalRooms(updatedRooms);
      onAddRoom(updatedRooms);
      toast.success("Room saved successfully!");

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
    setIsSubmitting(false);
  }
};

const handleUpdateRoom = async () => {
  if (!validateRoomData()) return;

  try {
    const roomToUpdate = localRooms[editingRoomIndex];
    const roomId = roomToUpdate._id || roomToUpdate.id;

    const result = await dispatch(
      updateRoom({ id: propertyId, roomId, data: currentRoomData })
    ).unwrap();

    // setIsComplete(true);
    const updatedRooms = [...localRooms];
    updatedRooms[editingRoomIndex] = currentRoomData;
    setLocalRooms(updatedRooms);
    onAddRoom(updatedRooms);
    setIsEditingRoom(false);
    setEditingRoomIndex(-1);
    setCurrentRoomData(getInitialRoomData());
    setFormErrors({});
  } catch (error) {
    console.error("Failed to update room:", error);
  }
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
  const ok = await confirm({
    title: 'Duplicate Room?',
    description: 'Media will not be copied to the duplicated room.',
    confirmText: 'Duplicate',
    confirmColor: 'primary',
  });
  if (!ok) return;
    
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
  return (
    <Paper className="p-4 mb-4">
      <ConfirmDialog />
      <Typography variant="h6" gutterBottom>
        {isEditingRoom ? "Edit Room" : "Add New Room"}
      </Typography>

      {validationError && (
        <Alert severity="error" sx={{ mb: 2 }}>{validationError}</Alert>
      )}

      {/* ── ROOM DETAILS FORM ── */}
      <Grid container spacing={3}>

        {/* Room Name */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <TextField
            name="roomName"
            fullWidth
            label="Room Name *"
            value={currentRoomData.roomName}
            onChange={(e) => handleRoomChange("roomName", e.target.value)}
            error={!!formErrors.roomName}
            helperText={formErrors.roomName}
            sx={{
              "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": { borderColor: "#2e2e2e" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1976d2" },
            }}
          />

          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item size={{ xs: 8 }}>
              <TextField
                name="roomSize"
                fullWidth
                label="Room Size *"
                type="number"
                slotProps={{ htmlInput: { onWheel: (e) => e.currentTarget.blur() } }}
                value={currentRoomData.roomSize}
                onChange={(e) => handleRoomChange("roomSize", e.target.value)}
                error={!!formErrors.roomSize}
                helperText={formErrors.roomSize}
                sx={{ mt: "10px" }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth sx={{ mt: "10px" }}>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={currentRoomData.sizeUnit}
                  onChange={(e) => handleRoomChange("sizeUnit", e.target.value)}
                  label="Unit"
                >
                  <MenuItem value="sqft">sq ft</MenuItem>
                  <MenuItem value="sqm">sq m</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>

        {/* Description */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            value={currentRoomData.description}
            onChange={(e) => handleRoomChange("description", e.target.value)}
          />
        </Grid>

        {/* Bed Configuration */}
        <Grid item size={{ xs: 12 }}>
          <Typography variant="subtitle1" gutterBottom>Bed Configuration *</Typography>
          {currentRoomData.beds.map((bed, index) => (
            <Grid container spacing={2} key={index} className="mb-3 items-end">
              <Grid item size={{ xs: 12 }} sm={4}>
                <FormControl fullWidth error={!!formErrors.beds?.[index]?.bedType}>
                  <InputLabel>Bed Type *</InputLabel>
                  <Select
                    name="beds"
                    value={bed.bedType}
                    onChange={(e) => handleBedChange(index, "bedType", e.target.value)}
                    label="Bed Type *"
                  >
                    {bedTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                  {formErrors.beds?.[index]?.bedType && (
                    <FormHelperText>{formErrors.beds[index].bedType}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Number of Beds *"
                  type="number"
                  slotProps={{ htmlInput: { onWheel: (e) => e.currentTarget.blur() } }}
                  value={bed.count}
                  onChange={(e) => handleBedChange(index, "count", parseInt(e.target.value))}
                  error={!!formErrors.beds?.[index]?.count}
                  helperText={formErrors.beds?.[index]?.count}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="People per Bed *"
                  type="number"
                  slotProps={{ htmlInput: { onWheel: (e) => e.currentTarget.blur() } }}
                  value={bed.accommodates}
                  onChange={(e) => handleBedChange(index, "accommodates", parseInt(e.target.value))}
                  error={!!formErrors.beds?.[index]?.accommodates}
                  helperText={formErrors.beds?.[index]?.accommodates}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item size={{ xs: 12 }} sm={2} className="flex justify-end">
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
          <Button startIcon={<AddIcon />} variant="outlined" onClick={addBed}>
            Add Another Bed
          </Button>
        </Grid>

        {/* Number of Rooms */}
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
              slotProps={{ htmlInput: { onWheel: (e) => e.currentTarget.blur() } }}
              sx={{ mt: "10px" }}
            />
          </Grid>
        </Grid>

        {/* Floor Bedding */}
        <Grid item size={{ xs: 12 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={currentRoomData.FloorBedding.available}
                onChange={(e) => handleNestedChange("FloorBedding", "available", e.target.checked)}
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
                  slotProps={{ htmlInput: { onWheel: (e) => e.currentTarget.blur() } }}
                  value={currentRoomData.FloorBedding.count}
                  onChange={(e) =>
                    handleNestedChange("FloorBedding", "count", parseInt(e.target.value))
                  }
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  label="People per Gaddi *"
                  type="number"
                  slotProps={{ htmlInput: { onWheel: (e) => e.currentTarget.blur() } }}
                  value={currentRoomData.FloorBedding.peoplePerFloorBedding}
                  onChange={(e) =>
                    handleNestedChange("FloorBedding", "peoplePerFloorBedding", parseInt(e.target.value))
                  }
                />
              </Grid>
            </Grid>
          )}
        </Grid>

        {/* Occupancy */}
        <Grid item size={{ xs: 12 }}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>Occupancy</Typography>
          <Grid container spacing={3}>
            <Grid item size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Base Adults *"
                type="number"
                slotProps={{ htmlInput: { onWheel: (e) => e.currentTarget.blur() } }}
                value={currentRoomData.occupancy?.baseAdults}
                onChange={(e) =>
                  handleNestedChange("occupancy", "baseAdults", parseInt(e.target.value))
                }
                error={!!formErrors.baseAdults}
                helperText={formErrors.baseAdults}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Maximum Occupancy (auto-calculated)"
                type="number"
                value={currentRoomData.occupancy?.maximumOccupancy}
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Bathroom */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" gutterBottom>Bathroom</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sx={{ mt: "10px" }}>
              <TextField
                fullWidth
                label="Bathroom Count *"
                type="number"
                slotProps={{ htmlInput: { onWheel: (e) => e.currentTarget.blur() } }}
                value={currentRoomData.bathrooms.count}
                onChange={(e) =>
                  handleNestedChange("bathrooms", "count", parseInt(e.target.value))
                }
                error={!!formErrors.bathroomCount}
                helperText={formErrors.bathroomCount}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={6}>
              <Box display="flex" flexDirection="column">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={currentRoomData.bathrooms.private}
                      onChange={(e) => handleBathroomTypeChange("private", e.target.checked)}
                    />
                  }
                  label="Private Bathroom"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={currentRoomData.bathrooms.shared}
                      onChange={(e) => handleBathroomTypeChange("shared", e.target.checked)}
                    />
                  }
                  label="Shared Bathroom"
                />
                {formErrors.bathroomType && (
                  <FormHelperText error>{formErrors.bathroomType}</FormHelperText>
                )}
              </Box>
            </Grid>
          </Grid>
        </Grid>

        {/* Meal Plan */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" gutterBottom>Meal Plan</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={currentRoomData.mealPlan.available}
                onChange={(e) => handleNestedChange("mealPlan", "available", e.target.checked)}
              />
            }
            label="Meal Plan Available"
          />
          {formErrors.mealPlan && (
            <FormHelperText error>{formErrors.mealPlan}</FormHelperText>
          )}
          {currentRoomData.mealPlan.available && (
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Meal Plan Type</InputLabel>
              <Select
                value={currentRoomData.mealPlan.planType}
                onChange={(e) => handleNestedChange("mealPlan", "planType", e.target.value)}
                label="Meal Plan Type"
              >
                <MenuItem value="Accommodation only">Accommodation only</MenuItem>
                <MenuItem value="Free Breakfast">Free Breakfast</MenuItem>
                <MenuItem value="Free Breakfast + Lunch">Free Breakfast + Lunch</MenuItem>
                <MenuItem value="Free Breakfast + Dinner">Free Breakfast + Dinner</MenuItem>
                <MenuItem value="Free Lunch">Free Lunch</MenuItem>
                <MenuItem value="Free Dinner">Free Dinner</MenuItem>
                <MenuItem value="Free Lunch + Dinner">Free Lunch + Dinner</MenuItem>
                <MenuItem value="Free Breakfast + Lunch + Dinner">Free Breakfast + Lunch + Dinner</MenuItem>
              </Select>
            </FormControl>
          )}
        </Grid>

        {/* Pricing */}
        <Grid item size={{ xs: 12 }}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>Pricing</Typography>
          <Grid container spacing={3}>
            <Grid item size={{ xs: 12 }} md={4}>
              <TextField
                name="baseAdultsCharge"
                fullWidth
                label="Base Price (per night) *"
                type="number"
                slotProps={{ htmlInput: { onWheel: (e) => e.currentTarget.blur() } }}
                value={currentRoomData.pricing?.baseAdultsCharge}
                onChange={(e) =>
                  handleNestedChange("pricing", "baseAdultsCharge", parseFloat(e.target.value))
                }
                error={!!formErrors.baseAdultsCharge}
                helperText={formErrors.baseAdultsCharge}
                InputProps={{ startAdornment: "₹" }}
              />
            </Grid>
            <Grid item size={{ xs: 12 }} md={4}>
              <TextField
                name="extraFloorBeddingCharge"
                fullWidth
                label="Extra Floor Bedding Charge"
                type="number"
                slotProps={{ htmlInput: { onWheel: (e) => e.currentTarget.blur() } }}
                value={currentRoomData.pricing?.extraFloorBeddingCharge}
                onChange={(e) =>
                  handleNestedChange("pricing", "extraFloorBeddingCharge", parseFloat(e.target.value))
                }
                InputProps={{ startAdornment: "₹" }}
              />
            </Grid>
          </Grid>
        </Grid>

      </Grid>

      {/* Amenities */}
      <RoomsAmenities
        roomAmenityCategories={roomAmenityCategories}
        currentRoomData={currentRoomData}
        selectedAmenityTab={selectedAmenityTab}
        setSelectedAmenityTab={setSelectedAmenityTab}
        handleRoomAmenityChange={handleRoomAmenityChange}
      />

      {/* Save / Back Buttons */}
      <div className="flex justify-end mt-4 gap-2">
        <Button variant="outlined" onClick={handleCancelForm}>Back</Button>
        <Button
          variant="contained"
          color="primary"
          disabled={isSubmitting && !isEditingRoom}
          onClick={isEditingRoom ? handleUpdateRoom : handleAddRoom}
        >
          {isEditingRoom ? "Update Room" : "Save Room"}
        </Button>
      </div>

      {/* ── MEDIA UPLOAD (below the form, only active after room is saved) ── */}
      <Divider sx={{ my: 4 }} />
      <SingleRoomMediaForm
        propertyId={propertyId}
        singleRoom={currentRoomData}        // ← always passes current data
        singleRoomId={currentRoomId}        // ← null until saved, disables upload button
        isFileSubmitting={isFileSubmiting}
        hideCompleteButton={true}
        onMediaUploaded={(updatedRoom) => {
      setCurrentRoomData(prev => ({ ...prev, media: updatedRoom.media }));
    }}
        onBack={handleCancelForm}
      />

      {/* Add New Room / Next */}
      {/* {!isEditingRoom && (
        <div className="flex justify-end mt-4 gap-2">
          <Button variant="outlined" onClick={handleAddNewForm}>
            Add New Room
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={localRooms.length === 0}
            onClick={() => handleCompleteRooms(propertyId)}
          >
            Next
          </Button>
        </div>
      )} */}
    </Paper>
  );
}

  // Room list view - your existing room list JSX
  return (
    <Box>
      <ConfirmDialog />
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

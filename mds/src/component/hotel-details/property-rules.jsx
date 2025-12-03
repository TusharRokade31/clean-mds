"use client"

import { getPrivacyPolicy } from "@/redux/features/privacyPolicy/privacyPolicySlice"
import { Card, CardContent, Tabs, Tab, Box, Typography } from "@mui/material"
import { Badge } from "@mui/material"
import { Clock, Users, FileText, Shield } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

// Custom TabPanel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

export default function PropertyRules() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [tabValue, setTabValue] = useState(0)
  const { currentPrivacyPolicy, loading, error } = useSelector((state) => state.privacyPolicy)

  useEffect(() => {
    if (id) {
      dispatch(getPrivacyPolicy(id))
    }
  }, [id, dispatch])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!currentPrivacyPolicy) return <div>No policy data found</div>

  // Extract data from API response
  const { checkInCheckOut, propertyRules, propertyRestrictions, petPolicy } = currentPrivacyPolicy

  // Generate dynamic rules arrays
  const checkInRules = [
    `Check-in: ${checkInCheckOut.checkInTime}`,
    `Check-out: ${checkInCheckOut.checkOutTime}`,
    checkInCheckOut.has24HourCheckIn ? "24-hour check-in available" : "Check-in during specified hours only",
  ]

  const coupleRules = [
    propertyRules.guestProfile.allowUnmarriedCouples 
      ? "Unmarried couples/guests with Local IDs are allowed" 
      : "Unmarried couples not allowed",
    propertyRules.guestProfile.allowGuestsBelow18 
      ? "Guests below 18 years are allowed" 
      : "Primary Guest should be atleast 18 years of age",
    propertyRules.guestProfile.allowOnlyMaleGuests 
      ? "Only male guests allowed" 
      : "Valid ID proof required for all guests",
  ]

  const generalRules = [
    `Accepted ID proofs: ${propertyRules.acceptableIdentityProofs.map(id => 
      id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    ).join(', ')}`,
    petPolicy.petsAllowed ? "Pets are allowed" : "Pets are not allowed",
    // propertyRestrictions.nonVegetarianFood.allowed 
    //   ? "Non-vegetarian food is allowed" 
    //   : "Outside food is not allowed",
    propertyRestrictions.alcoholSmoking.smokingAllowed 
      ? "Smoking is allowed in designated areas" 
      : "Smoking is prohibited in rooms",
    propertyRestrictions.noiseRestrictions.quietHours.enabled 
      ? `Quiet hours: ${propertyRestrictions.noiseRestrictions.quietHours.startTime} - ${propertyRestrictions.noiseRestrictions.quietHours.endTime}` 
      : "No specific quiet hours",
    propertyRestrictions.alcoholSmoking.alcoholAllowed 
      ? "Alcohol is allowed" 
      : "Alcohol is not allowed",
  ]

  const guestProfileRules = [
    "All guests must provide valid identification",
    "Guest information must match booking details",
    "Maximum occupancy limits strictly enforced",
    propertyRules.guestProfile.allowGuestsBelow18 
      ? "Children below 18 years are allowed" 
      : "Children below 18 years not allowed without proper authorization",
  ]

  const idProofRules = [
    "Original ID proof mandatory at check-in",
    "Photocopies not accepted",
    propertyRules.acceptableIdentityProofs.includes('passport') 
      ? "Foreign nationals must provide passport" 
      : "Passport required for foreign nationals",
    `Accepted documents: ${propertyRules.acceptableIdentityProofs.map(id => 
      id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    ).join(', ')}`,
  ]

  const isCouplesFriendly = propertyRules.guestProfile.allowUnmarriedCouples

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Property Rules</h2>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Check-in: {checkInCheckOut.checkInTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Check-out: {checkInCheckOut.checkOutTime}</span>
          </div>
        </div>
      </div>

      {/* Quick Rules Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Couple, Bachelor Rules</span>
              {isCouplesFriendly && (
                <Badge variant="secondary" className="text-xs">
                  COUPLE FRIENDLY
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {isCouplesFriendly 
                ? "Unmarried couples/guests with Local IDs are allowed." 
                : "Unmarried couples not allowed."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-green-500" />
              <span className="font-medium">ID Requirements</span>
            </div>
            <p className="text-sm text-gray-600">
              {propertyRules.guestProfile.allowGuestsBelow18 
                ? "Guests of all ages are welcome." 
                : "Primary Guest should be atleast 18 years of age."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="property rules tabs">
            <Tab label="Must Read Rules" />
            <Tab label="Guest Profile" />
            <Tab label="ID Proof Related" />
            <Tab label="Read All Property Rules" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Check-in & Check-out
              </h3>
              <ul className="space-y-2">
                {checkInRules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 shrink-0"></span>
                    <span className="text-sm text-gray-700">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Couple, Bachelor Rules
                {isCouplesFriendly && (
                  <Badge variant="secondary" className="text-xs">
                    COUPLE FRIENDLY
                  </Badge>
                )}
              </h3>
              <ul className="space-y-2">
                {coupleRules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 shrink-0"></span>
                    <span className="text-sm text-gray-700">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                General Rules
              </h3>
              <ul className="space-y-2">
                {generalRules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 shrink-0"></span>
                    <span className="text-sm text-gray-700">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <div>
            <h3 className="font-semibold mb-3">Guest Profile Requirements</h3>
            <ul className="space-y-2">
              {guestProfileRules.map((rule, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 shrink-0"></span>
                  <span className="text-sm text-gray-700">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <div>
            <h3 className="font-semibold mb-3">ID Proof Related Rules</h3>
            <ul className="space-y-2">
              {idProofRules.map((rule, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 shrink-0"></span>
                  <span className="text-sm text-gray-700">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Complete Property Rules</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please read all rules carefully before making a booking. These rules are in place to ensure a
                comfortable stay for all guests.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Check-in & Check-out Policy</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  {checkInRules.map((rule, index) => (
                    <li key={index}>• {rule}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Guest Policy</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  {[...coupleRules, ...guestProfileRules].map((rule, index) => (
                    <li key={index}>• {rule}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">General Guidelines</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  {generalRules.map((rule, index) => (
                    <li key={index}>• {rule}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </TabPanel>
      </Card>
    </div>
  )
}
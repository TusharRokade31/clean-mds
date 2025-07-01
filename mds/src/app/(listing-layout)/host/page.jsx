"use client"
import { Box, Card, CardContent, Typography, Grid } from "@mui/material"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Tooltip,
} from "recharts"
import { ArrowUpward, ArrowDownward } from "@mui/icons-material"

// Dummy data - replace with API calls
const metricCardsData = [
  {
    title: "New Booking",
    value: "1,879",
    change: 7.5,
    chartType: "bar",
    chartData: [
      { value: 45 },
      { value: 52 },
      { value: 48 },
      { value: 61 },
      { value: 55 },
      { value: 67 },
      { value: 43 },
      { value: 49 },
      { value: 65 },
    ],
  },
  {
    title: "Available Rooms",
    value: "55",
    change: -5.7,
    chartType: "donut",
    chartData: [
      { name: "Available", value: 55, color: "#4CAF50" },
      { name: "Occupied", value: 45, color: "#FF9800" },
    ],
  },
  {
    title: "Revenue",
    value: "$2,287",
    change: 5.3,
    chartType: "line",
    chartData: [
      { value: 2100 },
      { value: 2150 },
      { value: 2200 },
      { value: 2180 },
      { value: 2250 },
      { value: 2287 },
      { value: 2300 },
    ],
  },
  {
    title: "Checkout",
    value: "567",
    change: -2.4,
    chartType: "pie",
    chartData: [
      { name: "Completed", value: 400, color: "#4CAF50" },
      { name: "Pending", value: 100, color: "#2196F3" },
      { name: "Cancelled", value: 67, color: "#F44336" },
    ],
  },
]

const roomAvailabilityData = {
  occupied: 125,
  reserved: 87,
  available: 57,
  notReady: 25,
}

const reservationData = [
  { date: "01 Jan", booked: 44, cancelled: 12 },
  { date: "02 Jan", booked: 55, cancelled: 23 },
  { date: "03 Jan", booked: 41, cancelled: 20 },
  { date: "04 Jan", booked: 67, cancelled: 18 },
  { date: "05 Jan", booked: 22, cancelled: 13 },
  { date: "06 Jan", booked: 43, cancelled: 27 },
  { date: "07 Jan", booked: 55, cancelled: 12 },
  { date: "08 Jan", booked: 64, cancelled: 8 },
]

// Component for metric cards
const MetricCard = ({ data }) => {
  const renderChart = () => {
    switch (data.chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={60} style={{ overflow: "visible" }}>
            <BarChart data={data.chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <Tooltip
                cursor={{ fill: "rgba(255, 152, 0, 0.1)" }}
                wrapperStyle={{ zIndex: 1000 }}
                position={{ x: undefined, y: undefined }}
                allowEscapeViewBox={{ x: true, y: true }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #FF9800",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  padding: "8px 12px",
                  zIndex: 1000,
                }}
                labelStyle={{ color: "#FF9800", fontWeight: "bold" }}
              />
              <Bar dataKey="value" fill="#FF9800" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      case "donut":
        return (
          <ResponsiveContainer width="100%" height={60} style={{ overflow: "visible" }}>
            <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <Tooltip
                cursor={false}
                wrapperStyle={{ zIndex: 1000 }}
                position={{ x: undefined, y: undefined }}
                allowEscapeViewBox={{ x: true, y: true }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #4CAF50",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  padding: "8px 12px",
                }}
                formatter={(value, name) => [value, name]}
              />
              <Pie data={data.chartData} cx="50%" cy="50%" innerRadius={15} outerRadius={25} dataKey="value">
                {data.chartData?.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={entry.color}
                    strokeWidth={0}
                    style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.1))" }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )
      case "line":
        return (
          <ResponsiveContainer width="100%" height={60} style={{ overflow: "visible" }}>
            <LineChart data={data.chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <Tooltip
                cursor={{ stroke: "#2196F3", strokeWidth: 1, strokeDasharray: "3 3" }}
                wrapperStyle={{ zIndex: 1000 }}
                position={{ x: undefined, y: undefined }}
                allowEscapeViewBox={{ x: true, y: true }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #2196F3",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  padding: "8px 12px",
                }}
                labelStyle={{ color: "#2196F3", fontWeight: "bold" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2196F3"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#2196F3", stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={60} style={{ overflow: "visible" }}>
            <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <Tooltip
                cursor={false}
                wrapperStyle={{ zIndex: 1000 }}
                position={{ x: undefined, y: undefined }}
                allowEscapeViewBox={{ x: true, y: true }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #4CAF50",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  padding: "8px 12px",
                }}
                formatter={(value, name) => [value, name]}
              />
              <Pie data={data.chartData} cx="50%" cy="50%" outerRadius={25} dataKey="value">
                {data.chartData?.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={entry.color}
                    strokeWidth={0}
                    style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.1))" }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )
      default:
        return null
    }
  }

  return (
    <Card sx={{ height: "100%", overflow: "visible", position: "relative" }}>
      <CardContent sx={{ overflow: "visible" }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {data.title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {data.value}
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              {data.change > 0 ? (
                <ArrowUpward sx={{ fontSize: 16, color: "success.main" }} />
              ) : (
                <ArrowDownward sx={{ fontSize: 16, color: "error.main" }} />
              )}
              <Typography variant="body2" color={data.change > 0 ? "success.main" : "error.main"} fontWeight="medium">
                {Math.abs(data.change)}%
              </Typography>
            </Box>
          </Box>
          <Box width={80} height={60} sx={{ position: "relative", overflow: "visible" }}>
            {renderChart()}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

// Main Dashboard Component
const HotelDashboard = () => {
  // These functions can be replaced with actual API calls
  const fetchMetricData = async () => {
    // Replace with actual API call
    return metricCardsData
  }

  const fetchRoomAvailability = async () => {
    // Replace with actual API call
    return roomAvailabilityData
  }

  const fetchReservationData = async () => {
    // Replace with actual API call
    return reservationData
  }

  const totalRooms =
    roomAvailabilityData.occupied +
    roomAvailabilityData.reserved +
    roomAvailabilityData.available +
    roomAvailabilityData.notReady

  const roomStatusData = [
    {
      name: "Occupied",
      value: (roomAvailabilityData.occupied / totalRooms) * 100,
      count: roomAvailabilityData.occupied,
      color: "#FF9800",
    },
    {
      name: "Reserved",
      value: (roomAvailabilityData.reserved / totalRooms) * 100,
      count: roomAvailabilityData.reserved,
      color: "#FFB74D",
    },
    {
      name: "Available",
      value: (roomAvailabilityData.available / totalRooms) * 100,
      count: roomAvailabilityData.available,
      color: "#C8E6C9",
    },
    {
      name: "Not Ready",
      value: (roomAvailabilityData.notReady / totalRooms) * 100,
      count: roomAvailabilityData.notReady,
      color: "#E0E0E0",
    },
  ]

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {metricCardsData.map((metric, index) => (
          <Grid item size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <MetricCard data={metric} />
          </Grid>
        ))}
      </Grid>

      {/* Bottom Section */}
      <Grid container spacing={3}>
        {/* Room Availability */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "388px" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Room Availability
              </Typography>

              {/* Horizontal Bar Chart */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    height: 40,
                    borderRadius: 1,
                    overflow: "hidden",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  {roomStatusData.map((status, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: `${status.value}%`,
                        backgroundColor: status.color,
                        transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Status Grid */}
              <Grid container spacing={2}>
                <Grid item size={{ xs: 6 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Occupied
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {roomAvailabilityData.occupied}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{ xs: 6 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Reserved
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {roomAvailabilityData.reserved}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{ xs: 6 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Available
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {roomAvailabilityData.available}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{ xs: 6 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Not Ready
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {roomAvailabilityData.notReady}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Reservation Chart */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Reservation
                </Typography>
                <Box display="flex" gap={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: "#673AB7",
                        borderRadius: "2px",
                      }}
                    />
                    <Typography variant="body2">Booked</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: "#FF9800",
                        borderRadius: "2px",
                      }}
                    />
                    <Typography variant="body2">Cancelled</Typography>
                  </Box>
                </Box>
              </Box>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reservationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e0e0e0",
                      borderRadius: "4px",
                    }}
                  />
                  <Bar dataKey="booked" stackId="a" fill="#673AB7" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="cancelled" stackId="a" fill="#FF9800" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default HotelDashboard

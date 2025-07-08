"use client"
import RoomOccupancy from '@/component/RoomOccupancy/RoomOccupancy'
import React, { useEffect, useState } from 'react'

const page = () => {
 const [selectedProperty, setSelectedProperty] = useState(null);

 
   useEffect(() => {
     // Load selected property from localStorage
     const saved = localStorage.getItem("selectedProperty");
     if (saved) {
       setSelectedProperty(JSON.parse(saved));
     }
   }, []);
 
  return (
    <RoomOccupancy property={selectedProperty}/>
  ) 
}

export default page
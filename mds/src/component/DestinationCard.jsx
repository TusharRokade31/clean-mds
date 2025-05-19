import React from "react";

const DestinationCard = ({destination}) => {
  return (
    <div
      key={destination._id}
      className="flex-none w-64 sm:w-72 snap-start px-2"
    >
      <div className="rounded-lg overflow-hidden bg-white">
        <div className="relative h-48 w-full">
          <Image
            src={destination.image}
            alt={destination.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-medium">{destination.name}</h3>
          <p className="text-gray-500 text-sm">{destination.status}</p>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;

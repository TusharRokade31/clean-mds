import Image from "next/image";
import React from "react";
// import imagePng from "../../public/assets/hero-right.png";
import imagePng from "../../public/assets/hero-img2.jpeg";
import SearchBar from "./SearchBar";

const HomeBanner = () => {
  return (
    <div className="container relative mb-2 mx-auto px-4  pt-16 lg:mb-2 ">
      <div className="nc-SectionHero relative flex flex-col-reverse lg:flex-col pt-12  lg:pt-16">
        <div className="flex flex-col lg:flex-row lg:items-center">
          <div className="flex flex-shrink-0 flex-col items-start  `lg:me-10 lg:w-1/2 lg:pb-64 xl:me-0 xl:pe-14">
            <h2 className="text-4xl font-medium !leading-[114%] md:text-5xl xl:text-7xl">
              Find Your <br /> Divine Stay
            </h2>
            <span className="text-base text-neutral-500 mt-5   md:text-lg">
              From Kashi to Kedarnath, Find Peaceful, Affordable, and Trusted
              Religious Stays at Your Fingertips
            </span>
          </div>
          <div className="flex-grow">
            <Image className="w-full" src={imagePng} alt="hero" priority />
          </div>
        </div>
      </div>
      <div className="absolute bottom-40 left-0 right-0">
      <SearchBar/>
      </div>
      
    </div>
  );
};

export default HomeBanner;

import Image from "next/image";
import HomeBanner from "../component/homepage/HomeBanner";
import TrendingDestinations from "../component/homepage/TrendingDestinations";
import FeaturedStays from "../component/homepage/FeaturedStays";
import SpiritualDestinations from "../component/homepage/SpiritualDestinations";
import SectionHowItWork from "../component/homepage/HowitWork";
import SectionBecomeAnAuthor from "../component/homepage/SectionBecomeAnAuthor";
import SectionClientSay from "../component/homepage/SectionClientSay";
import StaysType from "../component/homepage/StaysType";

export default function Home() {
  return (
   <>
   <div className="">
    <HomeBanner/>
    <TrendingDestinations />
    <FeaturedStays />
    <SectionHowItWork/>
    <SpiritualDestinations />
    <SectionBecomeAnAuthor/>
    <StaysType />  
    <SectionClientSay/>
    </div>
   </>
  );
}

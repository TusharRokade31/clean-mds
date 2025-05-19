import Image from "next/image";
import HomeBanner from "../component/HomeBanner";
import TrendingDestinations from "../component/TrendingDestinations";
import FeaturedStays from "../component/FeaturedStays";
import SpiritualDestinations from "../component/SpiritualDestinations";
import SectionHowItWork from "../component/HowitWork";
import SectionBecomeAnAuthor from "../component/SectionBecomeAnAuthor";
import SectionClientSay from "../component/SectionClientSay";
import StaysType from "../component/StaysType";

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

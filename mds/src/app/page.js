import Image from "next/image";
import HomeBanner from "../component/homepage/HomeBanner";
import TrendingDestinations from "../component/homepage/TrendingDestinations";
import FeaturedStays from "../component/homepage/FeaturedStays";
import SpiritualDestinations from "../component/homepage/SpiritualDestinations";
import SectionHowItWork from "../component/homepage/HowitWork";
import SectionBecomeAnAuthor from "../component/homepage/SectionBecomeAnAuthor";
import SectionClientSay from "../component/homepage/SectionClientSay";
import StaysType from "../component/homepage/StaysType";
import FeaturedStays2 from "@/component/homepage/FeaturedStays2";

export const metadata = {
  title: "MDS - Dharamshala Booking Online | Temple & Ashram Accommodation",
  description: "Book your spiritual stay with ease. Find verified Dharamshala, Temple Accommodation, and Ashram Accommodation online across India. Secure & simple booking!",
  alternates: {
    canonical: "https://mydivinestays.com",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "My Divine Stays",
  "alternateName": "MDS",
  "url": "https://mydivinestays.com/",
  "logo": "https://mydivinestays.com/mds.png",
  "sameAs": [
    "https://www.facebook.com/mydivinestays/",
    "https://www.instagram.com/mydivinestays/",
    "https://www.youtube.com/channel/UCz634rRkL8gWBZ1qF3OrI7A",
    "https://in.pinterest.com/mydivinestays/",
    "https://www.linkedin.com/company/mydivinestays/"
  ]
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="">
        <HomeBanner />
        {/* <TrendingDestinations /> */}
        <FeaturedStays />
        {/* <FeaturedStays2 /> */}
        <SectionHowItWork />
        <SpiritualDestinations />
        <SectionBecomeAnAuthor />
        {/* <StaysType /> */}
        {/* <SectionClientSay/> */}
      </div>
    </>
  );
}
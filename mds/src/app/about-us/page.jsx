import React from 'react';
import Image from 'next/image';
import { 
  Users, 
  ShieldCheck, 
  MousePointerClick, 
  Globe, 
  Quote 
} from 'lucide-react';
import Banner from '../../../public/assets/hero-img.jpeg';
import HeaderBanner from '../../../public/assets/placeholder-large copy.png';

export default function AboutUs() {
  return (
    <main className="min-h-screen bg-white">
      {/* --- HERO SECTION --- */}
      <section className="relative h-[300px] flex items-center justify-center pt-5">
        <div className="absolute inset-0 z-0">
          {/* <Image 
            src={HeaderBanner.src} // Replace with your sacred site image
            alt="Spiritual Background"
            fill
            className="object-cover brightness-[0.4]"
            priority
          /> */}
        </div>
        <div className="relative  text-center text-black px-4">
          <h1 className="text-5xl md:text-7xl font-bold font-league-spartan mb-4">About Us</h1>
          <p className="text-lg md:text-xl font-alice max-w-2xl mx-auto opacity-90">
            Making spiritual stays organized, accessible, and efficient.
          </p>
        </div>
      </section>

      {/* --- CORE STORY SECTION --- */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            <Image 
              src={Banner.src} // Replace with a Dharamshala image
              alt="Dharamshala Room"
              fill
              className="object-cover"
            />
          </div>
          
          <div className="space-y-8">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-50 text-[#1035ac] font-semibold text-sm uppercase tracking-wider">
              Our Vision
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-league-spartan leading-tight">
              Bridging Tradition with Modern Technology
            </h2>
            <p className="text-lg text-gray-600 font-alice leading-relaxed">
              My Divine Stay (MDS) is an online booking and management platform created 
              exclusively for Dharamshalas. It allows pilgrims and devotees to search, 
              select, and book Dharamshala rooms easily from anywhere.
            </p>
            <p className="text-lg text-gray-600 font-alice leading-relaxed">
              With real-time availability, secure online payments, and complete transparency, 
              MDS simplifies the entire accommodation process for both guests and 
              Dharamshala management. It combines modern technology with the traditional 
              purpose of Dharamshalas.
            </p>
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white border-b-4 border-[#1035ac] rounded-xl shadow-sm text-center">
              <h3 className="text-4xl font-bold text-gray-900 font-league-spartan mb-2">200M+</h3>
              <p className="text-gray-500 font-alice">Annual Pilgrims in India</p>
            </div>
            <div className="p-8 bg-white border-b-4 border-[#1035ac] rounded-xl shadow-sm text-center">
              <h3 className="text-4xl font-bold text-gray-900 font-league-spartan mb-2">100%</h3>
              <p className="text-gray-500 font-alice">Secure Online Payments</p>
            </div>
            <div className="p-8 bg-white border-b-4 border-[#1035ac] rounded-xl shadow-sm text-center">
              <h3 className="text-4xl font-bold text-gray-900 font-league-spartan mb-2">Real-Time</h3>
              <p className="text-gray-500 font-alice">Room Availability</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- TRUE PARALLAX REVIEWS SECTION --- */}
      {/* <section className="relative h-[500px] text-black flex items-center justify-center overflow-hidden">
       
        <div 
          className="absolute inset-0 z-0 bg-fixed bg-center bg-cover"
          style={{ 
            backgroundImage: `url('${HeaderBanner.src}')`, // Replace with high-res yatra image
            filter: 'brightness(0.3)'
          }}
        ></div>
        
        <div className="relative  max-w-4xl mx-auto text-center px-6 ">
          <Quote className="w-12 h-12 mx-auto mb-8 text-[#1035ac] opacity-80" />
          <h2 className="text-3xl md:text-4xl font-alice italic leading-relaxed mb-8">
            "MDS made our pilgrimage stress-free. We were able to book a clean, 
            sacred stay in advance without the worry of availability upon arrival."
          </h2>
          <div className="space-y-1">
            <p className="font-bold font-league-spartan text-xl">Suresh Deshmukh</p>
            <p className="text-sm uppercase tracking-[0.2em] text-[#1035ac]">Verified Pilgrim</p>
          </div>
        </div>
      </section> */}

      {/* --- FEATURES / VALUES --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-league-spartan text-gray-900">Why Choose MDS?</h2>
            <div className="h-1.5 w-20 bg-[#1035ac] mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-4 gap-12 text-center">
            {[
              { icon: Users, title: "Exclusively Dharamshalas", desc: "Tailored specifically for the unique needs of spiritual stays." },
              { icon: ShieldCheck, title: "Complete Transparency", desc: "No hidden costs. What you see is what you pay." },
              { icon: MousePointerClick, title: "Easy Selection", desc: "Search, select, and book rooms in just a few clicks." },
              { icon: Globe, title: "Global Accessibility", desc: "Book your stay from anywhere in the world at any time." },
            ].map((item, idx) => (
              <div key={idx} className="group p-6 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
                <div className="w-16 h-16 bg-blue-50 text-[#1035ac] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <item.icon size={32} />
                </div>
                <h4 className="text-xl font-bold font-league-spartan mb-3">{item.title}</h4>
                <p className="text-gray-600 font-alice text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
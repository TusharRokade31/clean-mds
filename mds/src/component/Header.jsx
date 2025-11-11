"use client"
// components/Header.js
import React, { useState } from "react";
import Link from "next/link";
import logo from "../../public/assets/mds.png";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import NavMenu from "./NavMenu";  // Import the NavMenu
import SearchComponent from "./MobileSearchBar";
import { useSelector } from "react-redux";
import AvatarDropdown from "./AvatarDropdown";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (pathname.startsWith("/admin") || pathname.startsWith("/host")) {
    return null;
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };


    const handleListPropertyClick = () => {
    if (!isAuthenticated) {
      sessionStorage.setItem("redirectAfterLogin", "listProperty");
      toggleMenu()
    }
    toggleMenu()
  };

  return (
    <header className="border-b z-10 fixed top-0 right-0 left-0 bg-white/30 backdrop-blur-2xl border-[#e5e7eb]">
      <nav className="flex h-20 justify-between items-center mx-auto px-2 sm:px-4 lg:container">
        <div className="flex justify-center gap-x-3 sm:gap-x-8 lg:gap-x-10 items-center">
          <Link href="/" onClick={() => sessionStorage.removeItem("redirectAfterLogin")}>
            <img src={logo.src} className="w-20 " />
          </Link>
          
        </div>

        {/* Mobile Search Bar */}
        <SearchComponent />

        {/* Desktop Navigation */}
        <NavMenu />

        {/* Mobile Navigation - Toggle Menu */}
        <div className="flex lg:hidden items-center gap-x-4">
          {/* Mobile Authentication or Avatar Dropdown */}
        

          {/* Hamburger Menu Button */}
          <button 
            className="flex flex-col justify-center items-center w-8 h-8 gap-1.5 cursor-pointer z-50"
            onClick={toggleMenu}
          >
            <motion.span 
              animate={{ 
                rotate: isMenuOpen ? 45 : 0,
                translateY: isMenuOpen ? 8 : 0
              }}
              className="w-6 h-0.5 bg-gray-800 block origin-center"
            />
            <motion.span 
              animate={{ opacity: isMenuOpen ? 0 : 1 }}
              className="w-6 h-0.5 bg-gray-800 block"
            />
            <motion.span 
              animate={{ 
                rotate: isMenuOpen ? -45 : 0,
                translateY: isMenuOpen ? -8 : 0
              }}
              className="w-6 h-0.5 bg-gray-800 block origin-center"
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel with Framer Motion */}
<AnimatePresence>
  {isMenuOpen && (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white/30  z-50 lg:hidden"
        onClick={toggleMenu}
      />
      
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 20 }}
        className="fixed top-0 right-0 h-screen w-64 bg-white shadow-lg z-40 lg:hidden overflow-y-auto"
      >
        <div className="flex flex-col pt-12 px-6 gap-6">
          <Link href="/about-us" className="text-lg font-medium  hover:text-indigo-600 transition-colors">
            About us
          </Link>
          <Link href="/about-us" onClick={toggleMenu} className="text-lg font-medium  hover:text-indigo-600 transition-colors">
            About us
          </Link>
          <Link href="/host" onClick={handleListPropertyClick} className="text-lg font-medium text-gray-800 hover:text-indigo-600 transition-colors">
            List your property
          </Link>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
    </header>
  );
};

export default Header;

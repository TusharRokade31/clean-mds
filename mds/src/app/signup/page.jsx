// Signup page.jsx
"use client"
import React, { FC, useState } from 'react'
import facebookSvg from "../../../public/assets/Facebook.svg";
import twitterSvg from "../../../public/assets/Twitter.svg";
import googleSvg from "../../../public/assets/Google.svg";
import Image from 'next/image'
import Link from 'next/link'
import { signupUser } from '@/redux/features/auth/authSlice'
import { useRouter } from 'next/navigation'
import { useGoogleLogin } from '@react-oauth/google';
import { googleLoginUser } from '@/redux/features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux'


const loginSocials = [
  // {
  //   name: "Continue with Facebook",
  //   href: "#",
  //   icon: facebookSvg,
  // },
  // {
  //   name: "Continue with Twitter",
  //   href: "#",
  //   icon: twitterSvg,
  // },
  {
    name: "Continue with Google",
    href: "#",
    icon: googleSvg,
  },
];

const PageSignUp = ({}) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log("Token response:", tokenResponse);

        const result = await dispatch(
          googleLoginUser(tokenResponse.access_token)
        );
        
        if (result.meta.requestStatus === "fulfilled") {
          // Wait a bit to ensure cookie is set
          await new Promise(resolve => setTimeout(resolve, 100));
          
         // Check if there's a stored redirect path
      const storedPath = localStorage.getItem("hoteldetailPath");
      
      if (storedPath) {
        // Remove the stored path
        localStorage.removeItem("hoteldetailPath");
        // Redirect to the stored path
        window.location.href = storedPath;
      } else {
        // Default redirect to home
        window.location.href = "/";
      }
        }
      } catch (error) {
        console.error("Google login failed:", error);
      }
    },
    scope: "email profile",
    onError: () => {
      console.error("Google login failed");
    },
  });

  const { isLoading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
  });
  
  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };
  
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const result = await dispatch(signupUser(userData));
    
    if (result.meta.requestStatus === 'fulfilled') {
      // Small delay to ensure cookie is properly set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if there's a stored redirect path
      const storedPath = localStorage.getItem("hoteldetailPath");
      
      if (storedPath) {
        // Remove the stored path
        localStorage.removeItem("hoteldetailPath");
        // Redirect to the stored path
        window.location.href = storedPath;
      } else {
        // Default redirect to home
        window.location.href = "/";
      }
    }
  } catch (error) {
    console.error("Signup error:", error);
  }
};
  return (
    <div className={`nc-PageSignUp`}>
      <div className="mb-24 lg:mb-32">
        <h2 className="mt-24 lg:mt-40 mb-10 flex items-center justify-center text-3xl font-semibold leading-[115%] text-neutral-900  md:text-5xl md:leading-[115%]">
          {'Signup'}
        </h2>
        <div className="mx-auto max-w-md space-y-6">
          <div className="grid gap-3">
           {loginSocials.map((item, index) => (
              <a
                key={index}
                href={item.name.includes('Google') ? undefined : item.href}
                onClick={item.name.includes('Google') ? () => googleLogin() : undefined}
                className="flex w-full rounded-lg cursor-pointer bg-[#eef2ff] px-4 py-3 transition-transform hover:-translate-y-0.5 sm:px-6"
              >
                <Image
                  className="shrink-0"
                  src={item.icon}
                  alt={item.name}
                />
                <h3 className="grow text-center text-sm font-medium text-neutral-700  sm:text-sm">
                  {item.name}
                </h3>
              </a>
            ))}
          </div>
          {/* OR */}
          <div className="relative text-center">
            <span className="relative z-10 inline-block bg-white px-4 text-sm font-medium  ">
              OR
            </span>
            <div className="absolute left-0 top-1/2 w-full -translate-y-1/2 transform border border-neutral-100 "></div>
          </div>
          {/* FORM */}
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <label className="block">
              <span className="text-neutral-800 ">
                Full Name
              </span>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                className="mt-1 w-full border border-[#e5e7eb] py-3 px-4 rounded-2xl focus-within:outline-2 focus-within:outline-indigo-200"
                value={userData.name}
                onChange={handleChange}
                required
              />
            </label>
            <label className="block">
              <span className="text-neutral-800 ">
                {'Email address'}
              </span>
              <input
                type="email"
                name="email"
                placeholder="example@example.com"
                className="mt-1 w-full border border-[#e5e7eb] py-3 px-4 rounded-2xl focus-within:outline-2 focus-within:outline-indigo-200"
                value={userData.email}
                onChange={handleChange}
                required
              />
            </label>
            <label className="block">
              <span className="flex items-center justify-between text-neutral-800 ">
                {'Password'}
              </span>
              <input 
                type="password" 
                name="password"
                placeholder="password"
                className="mt-1 w-full border border-[#e5e7eb] py-3 px-4 rounded-2xl focus-within:outline-2 focus-within:outline-indigo-200" 
                value={userData.password}
                onChange={handleChange}
                required
              />
            </label>
            <button 
              className="bg-[#4f46e5] rounded-full text-white cursor-pointer py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing up...' : 'Continue'}
            </button>
          </form>

          {/* ==== */}
          <span className="block text-center text-neutral-700 ">
            {'Already have an account?'} {` `}
            <Link href="/login" className="font-semibold underline">
              {'Sign in'}
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}

export default PageSignUp
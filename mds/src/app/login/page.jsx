// Update the login page to use your auth system
"use client";
import React, { useState } from "react";
import facebookSvg from "../../../public/assets/Facebook.svg";
import twitterSvg from "../../../public/assets/Twitter.svg";
import googleSvg from "../../../public/assets/Google.svg";
import Image from "next/image";
import Link from "next/link";
import { loginUser } from "@/redux/features/auth/authSlice";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { googleLoginUser } from "@/redux/features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";

const loginSocials = [
  {
    name: "Continue with Facebook",
    href: "#",
    icon: facebookSvg,
  },
  {
    name: "Continue with Twitter",
    href: "#",
    icon: twitterSvg,
  },
  {
    name: "Continue with Google",
    href: "#",
    icon: googleSvg,
  },
];

const PageLogin = ({}) => {
  const dispatch = useDispatch();
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // Using any temporarily to bypass type checking
      try {
        // Google OAuth returns an authorization code or token depending on the flow
        console.log("Token response:", tokenResponse);

        // Pass whatever token we get to the backend
        const result = await dispatch(
          googleLoginUser(tokenResponse.access_token)
        );
        if (result.meta.requestStatus === "fulfilled") {
          router.push("/");
        }
      } catch (error) {
        console.error("Google login failed:", error);
      }
    },
    // Remove flow: 'implicit' as it's causing type errors
    scope: "email profile",
    onError: () => {
      console.error("Google login failed");
    },
  });

  const { isLoading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const router = useRouter();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(credentials));
    if (result.meta.requestStatus === "fulfilled") {
      router.push("/");
    }
  };

  return (
    <div className="px-4">
      <div className="mb-24 lg:mb-32">
        <h2 className="mt-24 lg:mt-40 mb-10 flex items-center justify-center text-3xl font-semibold  text-neutral-900  md:text-5xl ">
          {"Login"}
        </h2>
        <div className="mx-auto max-w-md space-y-6">
          <div className="grid gap-3">
            {loginSocials.map((item, index) => (
              <a
                key={index}
                href={item.name.includes("Google") ? undefined : item.href}
                onClick={
                  item.name.includes("Google") ? () => googleLogin() : undefined
                }
                className="flex w-full rounded-lg cursor-pointer bg-[#eef2ff] px-4 py-3 transition-transform hover:translate-y-[-2px] sm:px-6"
              >
                <Image
                  className="flex-shrink-0"
                  src={item.icon}
                  alt={item.name}
                />
                <h3 className="flex-grow text-center text-sm font-medium text-neutral-700  sm:text-sm">
                  {item.name}
                </h3>
              </a>
            ))}
          </div>
          {/* OR */}
          <div className="relative text-center">
            <span className="relative z-10 inline-block bg-white px-4 text-sm font-medium   ">
              OR
            </span>
            <div className="absolute left-0 top-1/2 w-full -translate-y-1/2 border border-neutral-100 "></div>
          </div>
          {/* FORM */}
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <label className="flex items-start flex-col">
              <span className="text-neutral-800 ">
                {"Email address"}
              </span>
              <input
                type="email"
                name="email"
                placeholder="example@example.com"
                className="mt-1 w-full border border-[#e5e7eb] py-3 px-4 rounded-2xl focus-within:outline-2 focus-within:outline-indigo-200"
                value={credentials.email}
                onChange={handleChange}
                required
              />
            </label>
            <label className="flex items-start flex-col">
              <div className="flex w-full items-center justify-between text-neutral-800 ">
                {"Password"}
                <Link href="/login" className="text-sm font-medium underline">
                  {"Forgot password?"}
                </Link>
              </div>
              <input
                type="password"
                name="password"
                className="mt-1 w-full border border-[#e5e7eb] py-3 px-4 rounded-2xl focus-within:outline-2 focus-within:outline-indigo-200"
                value={credentials.password}
                onChange={handleChange}
                required
              />
            </label>
            <button
              type="submit"
              className="bg-[#4f46e5] rounded-full text-white cursor-pointer py-3 px-4"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Continue"}
            </button>
          </form>

          {/* ==== */}
          <div className=" text-center text-neutral-700 ">
            {`New user?`}
            <Link href="/signup" className="font-semibold ms-1 underline">
              {"Create an account"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLogin;

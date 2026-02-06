import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import AvatarDropdown from "./AvatarDropdown";
import SearchComponent from "./MobileSearchBar";
import { useEffect } from "react";
import { fetchCurrentUser } from "@/redux/features/auth/authSlice";

const NavMenu = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [])

  // Function to handle click on "List your property"
  const handleListPropertyClick = () => {
    if (!isAuthenticated) {
      sessionStorage.setItem("redirectAfterLogin", "listProperty");
    }
  };

  return (
    <div className="hidden lg:flex text-[#374151] gap-x-1 items-center">
      <Link href={`/about-us`}>
        <h3 className="border border-[#9ca3af5b] cursor-pointer hover:border-[#9ca3af] rounded-full py-1.5 px-4">
          About us
        </h3>
      </Link>

      {/* <Link href={`/host`} onClick={handleListPropertyClick}>
        <h3 className="border border-[#9ca3af5b] cursor-pointer hover:border-[#9ca3af] rounded-full py-1.5 px-4">
          List your property
        </h3>
      </Link> */}

      {!isAuthenticated ? (
        <Link href="/login">
          <button className="rounded-full bg-[#4f46e5] cursor-pointer text-white py-2 px-4">
             <h3>
          Log in
        </h3>
          </button>
        </Link>
      ) : (
        <AvatarDropdown />
      )}
    </div>
  );
};

export default NavMenu;

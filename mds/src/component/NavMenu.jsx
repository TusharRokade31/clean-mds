// components/NavMenu.js
import Link from "next/link";
import { useSelector } from "react-redux";
import AvatarDropdown from "./AvatarDropdown";
import SearchComponent from "./MobileSearchBar";

const NavMenu = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="hidden md:flex text-[#374151] gap-x-1 items-center">
      <h3 className="border border-[#9ca3af5b] cursor-pointer hover:border-[#9ca3af] rounded-full py-1.5 px-4">
        About us
      </h3>
      <Link href={`/list-property`}>
        <h3 className="border border-[#9ca3af5b] cursor-pointer hover:border-[#9ca3af] rounded-full py-1.5 px-4">
          List your property
        </h3>
      </Link>
      {!isAuthenticated ? (
        <Link href="/login">
          <button className="rounded-full bg-[#4f46e5] cursor-pointer text-white py-2 px-4">
            Log in
          </button>
        </Link>
      ) : (
        <AvatarDropdown />
      )}
    </div>
  );
};

export default NavMenu;

import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useDispatch, useSelector } from "react-redux";
import { clearToken } from "../redux/doctor";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token, user } = useSelector((state) => state.doctor);

  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    dispatch(clearToken());
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between py-4 px-5 border-b border-gray-300 mb-5">
      <img
        onClick={() => navigate("/")}
        className="w-44 cursor-pointer"
        src={assets.logo}
        alt="Logo"
      />

      <ul className="hidden md:flex items-center gap-6 font-medium">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/doctors">All Doctors</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </ul>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {token ? (
          <div className="relative">
            {/* User Avatar */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              <img
                src={user?.image || assets.profile_pic}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border"
              />
              <img
                src={assets.dropdown_icon}
                alt="dropdown"
                className="w-2.5"
              />
            </div>

            {showDropdown && (
              <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-lg py-2 text-gray-700 z-20">
                <p
                  onClick={() => {
                    navigate("/my-profile");
                    setShowDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  My Profile
                </p>
                <p
                  onClick={() => {
                    navigate("/my-appointments");
                    setShowDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Appointments
                </p>
                <p
                  onClick={handleLogout}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Logout
                </p>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="hidden md:block bg-[#5f6FFF] text-white px-6 py-2 rounded-full font-medium"
          >
            Create Account
          </button>
        )}

        <img
          onClick={() => setShowMenu(true)}
          src={assets.menu_icon}
          alt="Menu"
          className="w-6 md:hidden cursor-pointer"
        />
      </div>

      {showMenu && (
        <div className="fixed inset-0 z-30 bg-white flex flex-col">
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
            <img src={assets.logo} alt="Logo" className="w-36" />
            <img
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon}
              alt="Close"
              className="w-7 cursor-pointer"
            />
          </div>

          <ul className="flex flex-col mt-6 gap-4 px-5 text-lg font-medium">
            <NavLink onClick={() => setShowMenu(false)} to="/">
              Home
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/doctors">
              All Doctors
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/about">
              About
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/contact">
              Contact
            </NavLink>
            {!token && (
              <NavLink onClick={() => setShowMenu(false)} to="/login">
                Login
              </NavLink>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

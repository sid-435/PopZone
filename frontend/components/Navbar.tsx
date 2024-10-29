"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [active, setActive] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const navLinks = [
    { id: "Dashboard", title: "Dashboard", href: "/" },
    { id: "Settings", title: "Settings", href: "/settings" },
  ];

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");

    // Redirect to login page
    router.push("/signin");
  };

  return (
    <nav className="w-full py-5 fixed top-0 z-20 bg-gray-800">
      <div className="w-full flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => {
            setActive("");
            window.scrollTo(0, 0);
          }}
        >
          <span className="text-white text-lg font-bold">App Name</span>
        </Link>

        <ul className="list-none hidden md:flex flex-row gap-6">
          {navLinks.slice(0, 6).map((link) => (
            <li
              key={link.id}
              className={`${active === link.title ? "text-white" : "text-gray-400"} hover:text-white text-[18px] font-medium cursor-pointer`}
              onClick={() => setActive(link.title)}
            >
              <Link href={link.href}>{link.title}</Link>
            </li>
          ))}
        </ul>

        <div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white text-[18px] font-medium ml-4"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
          >
            <span className="sr-only">Open main menu</span>
            {!isOpen ? (
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link key={link.id} href={link.href}>
                <p
                  className={`${active === link.title ? "text-white" : "text-gray-400"} block px-3 py-2 rounded-md text-base font-medium`}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {link.title}
                </p>
              </Link>
            ))}
            {/* Logout Button in Mobile Menu */}
            <p
              className="text-gray-400 hover:text-white block px-3 py-2 rounded-md text-base font-medium cursor-pointer"
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
            >
              Logout
            </p>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
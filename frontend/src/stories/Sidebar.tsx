"use client";

import React from "react";
import { usePathname } from "next/navigation";

interface SidebarItem {
  name: string;
  icon: string;
}

interface SidebarProps {
  sections: SidebarItem[];
  user: { name: string };
}

const Sidebar: React.FC<SidebarProps> = ({ sections, user }) => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white h-screen shadow-md flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4 text-black">Ask Arny</h1>
        <nav className="space-y-2">
          {sections.map((item, index) => (
            <a
              key={index}
              href={`/${item.name}`}
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded transition ${
                pathname === `/${item.name}` ? "bg-gray-100" : ""
              }`}
            >
              <span className="mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                </svg>
              </span>
              <span>{item.name}</span>
            </a>
          ))}

          <hr className="my-2 border-gray-300" />

          {/* ✅ User Profile link */}
          <a
            href="/profile"
            className={`flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded transition ${
              pathname === "/profile" ? "bg-gray-100" : ""
            }`}
          >
            <span className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20h10M12 4v16m0 0H8m4 0h4" />
              </svg>
            </span>
            <span>{user.name}</span>
          </a>

          <hr className="my-2 border-gray-300" />

          {/* ✅ Settings link */}
          <a
            href="/settings"
            className={`flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded transition ${
              pathname === "/settings" ? "bg-gray-100" : ""
            }`}
          >
            <span className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 1v3M8.5 2.5l2 2M1 12h3m16 0h3m-9 7l2 2M6.5 21.5l2-2M21 12l2-2M6 9h12v6H6V9z" />
              </svg>
            </span>
            <span>settings</span>
          </a>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
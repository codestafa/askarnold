"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

interface SidebarItem {
  name: string;
  icon: string;
}

interface SidebarProps {
  sections: SidebarItem[];
  user: {
    name: string;
    image?: string;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ sections, user }) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeSidebar = () => setOpen(false);

  return (
    <>
      <div className="lg:hidden flex items-center justify-between bg-white shadow px-4 py-3 sticky top-0 z-50">
        <h1 className="text-xl font-bold text-black">Ask Arny</h1>
        <button onClick={() => setOpen(!open)} className="text-black">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <aside
        className={`fixed inset-0 bg-white z-50 transform transition-transform
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:inset-y-0 lg:left-0 lg:w-64 lg:translate-x-0 lg:bg-white lg:border-r lg:border-gray-200 lg:z-auto`}
      >
        <div className="flex flex-col justify-between h-full px-4 py-6">
          <div className="lg:hidden flex justify-end mb-4">
            <button onClick={closeSidebar} className="text-black p-2">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center gap-3 mb-6">
            {user.image && (
              <img
                src={user.image}
                alt={user.name}
                className="w-10 h-10 rounded-full border"
              />
            )}
            <span className="text-sm font-semibold text-gray-700">{user.name}</span>
          </div>

          <nav className="space-y-2 flex-1">
            {sections.map((item, index) => {
              const link = item.name === 'About' ? '/' : `/${item.name}`;
              const isActive = pathname === link;
              return (
                <a
                  key={index}
                  href={link}
                  onClick={closeSidebar}
                  className={`flex items-center p-2 rounded transition ${
                    isActive
                      ? "bg-gray-200 text-black font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </span>
                  <span className="capitalize">{item.name}</span>
                </a>
              );
            })}

            <hr className="my-4 border-gray-300" />

            <a
              href="/settings"
              onClick={closeSidebar}
              className={`flex items-center p-2 rounded transition ${
                pathname === "/settings"
                  ? "bg-gray-200 text-black font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v3M8.5 2.5l2 2M1 12h3m16 0h3m-9 7l2 2M6.5 21.5l2-2M21 12l2-2M6 9h12v6H6V9z" />
                </svg>
              </span>
              <span>Settings</span>
            </a>
          </nav>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;

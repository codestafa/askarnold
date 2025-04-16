'use client';

import React from "react";
import { usePathname } from "next/navigation";

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

  return (
    <aside className="w-64 bg-white h-screen shadow-md flex flex-col">
      <div className="p-6 flex-1">
        <h1 className="text-xl font-bold mb-4 text-black">Ask Arny</h1>

        <div className="flex items-center gap-3 mb-4">
          {user.image && (
            <img
              src={user.image}
              alt={user.name}
              className="w-8 h-8 rounded-full border"
            />
          )}
          <span className="text-sm font-medium text-gray-700">{user.name}</span>
        </div>

        <nav className="space-y-2">
          {sections.map((item, index) => {
            const link = `/${item.name}`;
            const isActive = pathname === link;

            return (
              <a
                key={index}
                href={link}
                className={`flex items-center p-2 rounded transition ${
                  isActive ? 'bg-gray-200 text-black font-medium' : 'text-gray-700 hover:bg-gray-100'
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={item.icon}
                    />
                  </svg>
                </span>
                <span>{item.name}</span>
              </a>
            );
          })}

          <hr className="my-2 border-gray-300" />

          <a
            href="/settings"
            className={`flex items-center p-2 rounded transition ${
              pathname === "/settings"
                ? "bg-gray-200 text-black font-medium"
                : "text-gray-700 hover:bg-gray-100"
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 1v3M8.5 2.5l2 2M1 12h3m16 0h3m-9 7l2 2M6.5 21.5l2-2M21 12l2-2M6 9h12v6H6V9z"
                />
              </svg>
            </span>
            <span>Settings</span>
          </a>
        </nav>
      </div>

      <form
        action="http://localhost:8000/logout"
        method="POST"
        className="p-4 border-t border-gray-200"
      >
        <button
          type="submit"
          className="text-sm text-red-600 hover:text-red-400 transition"
        >
          Logout
        </button>
      </form>
    </aside>
  );
};

export default Sidebar;
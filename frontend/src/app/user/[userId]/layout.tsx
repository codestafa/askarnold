"use client";

import Sidebar from "../../../stories/Sidebar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "../../../types/users";

const sections = [
  { name: 'About', icon: 'M3 9.5L12 3l9 6.5v9.5a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H9v4a2 2 0 01-2 2H3a2 2 0 01-2-2V9.5z' },
  { name: 'chat', icon: 'M3 5a3 3 0 013-3h12a3 3 0 013 3v10a3 3 0 01-3 3H9l-6 3V5z' },
  { name: 'workouts', icon: 'M15 12l-3-3m0 0l-3 3m3-3v12M5 12a7 7 0 0114 0v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4z' },
  { name: 'community', icon: 'M16 14a4 4 0 10-8 0v2h8v-2zm-4-6a2 2 0 110-4 2 2 0 010 4z' }
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((u: User) => setMe(u))
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !me) return null;

  return (
    <div className="h-screen bg-white text-gray-800 lg:flex">
      {/* sidebar always visible */}
      <Sidebar
        sections={sections}
        user={{ name: me.name, image: me.picture }}
      />

      {/* main content */}
      <main className="flex-1 overflow-auto bg-gray-50 p-10">
        {children}
      </main>
    </div>
  );
}

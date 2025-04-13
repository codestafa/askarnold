'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../stories/Sidebar";

export default function CommunityPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const sections = [
    { name: "chat", icon: "M3 9.5L12 3l9 6.5v9.5a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H9v4a2 2 0 01-2 2H3a2 2 0 01-2-2V9.5z" },
    { name: "workouts", icon: "M15 12l-3-3m0 0l-3 3m3-3v12M5 12a7 7 0 0114 0v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4z" },
    { name: "community", icon: "M3 5a3 3 0 013-3h12a3 3 0 013 3v10a3 3 0 01-3 3H9l-6 3V5z" },
  ];

  useEffect(() => {
    fetch("http://localhost:8000/auth/me", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setUser)
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar sections={sections} user={{ name: user.name, image: user.picture }} />

      <div className="flex flex-1 justify-center items-center p-6">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg flex flex-col items-center">
          <img
            src={user.picture || "https://via.placeholder.com/150"}
            alt="User avatar"
            className="rounded-full w-24 h-24 object-cover border-4 border-gray-300"
          />
          <h2 className="text-2xl font-bold mt-4 text-gray-900">{user.name}</h2>
          {user.username && (
            <p className="text-gray-500">@{user.username}</p>
          )}
          <p className="text-gray-500 text-center mt-2">{user.bio}</p>
          <p className="text-gray-400 text-sm mt-1">{user.location}</p>
          <p className="text-gray-500 mt-2">{user.email}</p>
          <p className="text-gray-500 text-center mt-4">Welcome to the community!</p>
        </div>
      </div>
    </div>
  );
}

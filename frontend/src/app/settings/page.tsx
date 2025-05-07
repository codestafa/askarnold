'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../stories/Sidebar";
import {User} from "../../types/users"

export default function Settings() {
  const [user, setUser] = useState<User | null>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const sections = [
    { name: 'About', icon: 'M3 9.5L12 3l9 6.5v9.5a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H9v4a2 2 0 01-2 2H3a2 2 0 01-2-2V9.5z' },
    { name: 'chat', icon: 'M3 5a3 3 0 013-3h12a3 3 0 013 3v10a3 3 0 01-3 3H9l-6 3V5z' },
    { name: 'workouts', icon: 'M15 12l-3-3m0 0l-3 3m3-3v12M5 12a7 7 0 0114 0v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4z' },
    { name: 'community', icon: 'M16 14a4 4 0 10-8 0v2h8v-2zm-4-6a2 2 0 110-4 2 2 0 010 4z' }
  ];

  useEffect(() => {
    fetch("http://localhost:8000/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthenticated");
        return res.json();
      })
      .then(setUser)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    setUser(null);
    await fetch("http://localhost:8000/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
  };

  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar sections={sections} user={{ name: user.name, image: user.picture }} />

      <div className="flex flex-1 justify-center items-center p-6">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg flex flex-col items-center">
          <img
            src={user.picture || "https://via.placeholder.com/150"}
            alt="Avatar"
            className="rounded-full w-24 h-24 object-cover border-4 border-gray-300"
          />
          <h2 className="text-2xl font-bold mt-4 text-gray-900">{user.name}</h2>
          {user.name && (
            <p className="text-gray-500">@{user.name}</p>
          )}
          <p className="text-gray-500 mt-2">{user.email}</p>
          <div className="mt-6 w-full flex justify-center">
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

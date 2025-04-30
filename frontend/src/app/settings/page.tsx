'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../stories/Sidebar";
import {User} from "../../types/users"

export default function Settings() {
  const [user, setUser] = useState<User | null>();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();

  const sections = [
    { name: 'chat', icon: 'M3 9.5L12 3l9 6.5v9.5a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H9v4a2 2 0 01-2 2H3a2 2 0 01-2-2V9.5z' },
    { name: 'workouts', icon: 'M15 12l-3-3m0 0l-3 3m3-3v12M5 12a7 7 0 0114 0v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4z' },
    { name: 'community', icon: 'M3 5a3 3 0 013-3h12a3 3 0 013 3v10a3 3 0 01-3 3H9l-6 3V5z' },
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

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.name || "");
    }
  }, [user]);

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
          <div className="mt-6 flex gap-4 w-full">
          <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md text-gray-900">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Edit Profile</h3>

            <input
              type="text"
              placeholder="Name"
              className="w-full mb-3 px-4 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Username"
              className="w-full mb-3 px-4 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => {
                  // Save logic
                  setIsModalOpen(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

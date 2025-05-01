'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../stories/Sidebar';
import { User } from '../types/users';
import "../../src/app/globals.css";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const sections = [
    { name: 'chat', icon: 'M3 9.5L12 3l9 6.5v9.5a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H9v4a2 2 0 01-2 2H3a2 2 0 01-2-2V9.5z' },
    { name: 'workouts', icon: 'M15 12l-3-3m0 0l-3 3m3-3v12M5 12a7 7 0 0114 0v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4z' },
    { name: 'community', icon: 'M3 5a3 3 0 013-3h12a3 3 0 013 3v10a3 3 0 01-3 3H9l-6 3V5z' },
  ];

  useEffect(() => {
    fetch('http://localhost:8000/auth/me', {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((user) => {
        setUser(user);
        setLoading(false);
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [router]);

  if (loading || !user) return null;

  return (
    <div className="flex bg-white min-h-screen">
      <Sidebar sections={sections} user={{ name: user.name || user.name || "Unknown", image: user.picture }} />
      <main className="flex-1 p-10 flex flex-col justify-center items-center text-center bg-gray-50">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Welcome to Ask Arny</h1>
        <p className="text-lg text-gray-700 max-w-2xl mb-6">
          Your personalized fitness companion. Whether you are looking for workout plans, need help from an AI coach, or want to connect with a fitness community — Ask Arny has your back.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/chat')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Chat with Arny
          </button>
          <button
            onClick={() => router.push('/workouts')}
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
          >
            View Workouts
          </button>
        </div>
      </main>
    </div>
  );
}

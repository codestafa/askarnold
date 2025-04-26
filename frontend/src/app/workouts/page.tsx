"use client";

import { useState, useEffect, Suspense } from "react";
import type { Workout } from "../../types/workout";
import type { User } from "../../types/users";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../stories/Sidebar";
import { MessageSquare } from "lucide-react";
import { parseSections } from "../../lib/utils";

function WorkoutsContent({ user, limit }: { user: User; limit: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "0", 10);

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/workouts/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId: user.id, offset: currentPage * limit, limit: limit + 1 }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Fetch error");
        return res.json();
      })
      .then((data: { workouts: Workout[] }) => {
        setHasMore(data.workouts.length > limit);
        setWorkouts(data.workouts.slice(0, limit));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, currentPage, limit]);

  const goTo = (page: number) => router.push(`/workouts?page=${page}`);

  if (loading) return <div className="p-4">Loading workouts…</div>;

  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        {workouts.map((w) => {
          const sections = parseSections(w.planText);
          return (
            <div key={w.id} className="border bg-white p-6 rounded-lg shadow hover:shadow-md transition">
              <h5 className="text-xl font-semibold text-gray-900 mb-4">Workout #{w.id}</h5>
              {sections.map((sec, i) => (
                <div key={i} className="mb-4">
                  {sec.title && <h6 className="text-gray-800 font-medium mb-2">{sec.title}</h6>}
                  <ul className="space-y-1 text-gray-700">
                    {sec.items.map((item, j) => (
                      <li key={j}>- {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="flex justify-between items-center text-gray-400 text-xs">
                <span>{new Date(w.createdAt).toLocaleDateString()}</span>
                <button
                  onClick={() => alert(`Tracking progress for #${w.id}`)}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                >
                  Track
                  <MessageSquare className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex justify-center space-x-4">
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 0}
          className="px-5 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 transition"
        >
          Previous
        </button>
        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={!hasMore}
          className="px-5 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 transition"
        >
          Next
        </button>
      </div>
    </>
  );
}

export default function WorkoutsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const limit = 4;

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((u: User) => setUser(u))
      .catch(() => router.push("/login"));
  }, [router]);

  if (isDesktop === null) return null;
  if (!isDesktop)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-4 text-center">
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">Desktop Only</h2>
          <p className="text-gray-600">
            This site is optimized for desktop screens. Please switch to a larger device for the best experience.
          </p>
        </div>
      </div>
    );
  if (!user) return <div className="p-4">Loading user…</div>;

  const sections = [
    { name: "chat", icon: "M3 9.5L12 3l9 6.5v9.5a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H9v4a2 2 0 01-2 2H3a2 2 0 01-2-2V9.5z" },
    { name: "workouts", icon: "M15 12l-3-3m0 0l-3 3m3-3v12M5 12a7 7 0 0114 0v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4z" },
    { name: "community", icon: "M3 5a3 3 0 013-3h12a3 3 0 013 3v10a3 3 0 01-3 3H9l-6 3V5z" },
  ];

  return (
    <div className="flex h-screen">
      <Sidebar sections={sections} user={{ name: user.name, image: user.picture }} />
      <main className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Your Workouts</h1>
          <Suspense fallback={<div>Loading workouts…</div>}>
            <WorkoutsContent user={user} limit={limit} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

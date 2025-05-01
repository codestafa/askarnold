"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import type { Workout } from "../../types/workout";
import type { User } from "../../types/users";
import Sidebar from "../../stories/Sidebar";
import { parseSections } from "../../lib/utils";

const CardWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white p-5 rounded-xl shadow-md flex flex-col min-h-[400px] sm:min-h-[500px] xl:min-h-[550px]">
    {children}
  </div>
);

export default function WorkoutsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((u: User) => setUser(u))
      .catch(() => router.push("/login"));
  }, [router]);

  if (!user)
    return <div className="p-4 text-center text-gray-800">Loading user…</div>;

  const sections = [
    { name: "chat", icon: "M3 9.5L12 3l9 6.5v9.5a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H9v4a2 2 0 01-2 2H3a2 2 0 01-2-2V9.5z" },
    { name: "workouts", icon: "M15 12l-3-3m0 0l-3 3m3-3v12M5 12a7 7 0 0114 0v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4z" },
    { name: "community", icon: "M3 5a3 3 0 013-3h12a3 3 0 013 3v10a3 3 0 01-3 3H9l-6 3V5z" },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800 lg:flex">
      <Sidebar sections={sections} user={{ name: user.name, image: user.picture }} />
      <main className="flex-1 bg-gray-50 text-gray-800 px-4 py-5 sm:px-6 md:px-8">
        <h1 className="text-3xl font-bold mb-6">{user.name}’s Workouts</h1>
        <WorkoutsContent limit={6} currentUserName={user.name} />
      </main>
    </div>
  );
}

function WorkoutsContent({
  limit,
  currentUserName,
}: {
  limit: number;
  currentUserName: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "0", 10);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [mainWorkoutId, setMainWorkoutId] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/workouts/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ offset: page * limit, limit: limit + 1 }),
    })
      .then((r) => r.json())
      .then((data: { workouts: Workout[]; mainWorkoutId: number | null }) => {
        const fetched = data.workouts || [];
        setWorkouts(fetched.slice(0, limit));
        setHasMore(fetched.length > limit);
        setMainWorkoutId(data.mainWorkoutId);
      })
      .catch((err) => {
        console.error("Failed to fetch workouts:", err);
        setWorkouts([]);
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  }, [page, limit]);

  const deleteWorkout = async () => {
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/workouts/${confirmDelete}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setWorkouts((prev) => prev.filter((w) => w.id !== confirmDelete));
        if (confirmDelete === mainWorkoutId) setMainWorkoutId(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmDelete(null);
    }
  };

  const toggleMain = async (id: number) => {
    try {
      const res = await fetch("/api/workouts/set-main", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ workoutId: id }),
      });
      if (res.ok) {
        const { message } = await res.json();
        setMainWorkoutId(message.includes("unset") ? null : id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-800">Loading…</div>;

  if (workouts.length === 0)
    return (
      <div className="flex flex-col items-center justify-center mt-12 text-gray-700">
        <div className="text-5xl mb-4">🤖</div>
        <h2 className="text-2xl font-semibold mb-2 text-gray-900">No workout plans yet!</h2>
        <p className="mb-6 text-center text-gray-600">
          Chat with <span className="font-semibold text-blue-600">Arny</span> to get started.
        </p>
        <button
          onClick={() => router.push("/chat")}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
        >
          Chat with Arny
        </button>
      </div>
    );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full max-w-screen-xl mx-auto">
        {workouts.map((w) => {
          const parts = parseSections(w.planText);
          const isMain = w.id === mainWorkoutId;
          const isAdopted = w.adopted === true;
          const title = w.workoutName ?? `${currentUserName}’s Workout #${w.id}`;
          const date = new Date(w.createdAt);
          const dateText = isNaN(date.getTime()) ? "" : date.toLocaleDateString();

          return (
            <CardWrapper key={w.id}>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-gray-900">{title}</span>
                      {isAdopted && (
                        <span className="text-xs font-medium px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full border border-indigo-300">
                          Adopted
                        </span>
                      )}
                      {isMain && (
                        <span className="text-xs font-medium text-yellow-500">⭐ Main</span>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => toggleMain(w.id)}
                        className={`px-3 py-1 rounded text-xs font-medium transition ${
                          isMain
                            ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                      >
                        {isMain ? "Unselect Main" : "Make Main"}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(w.id)}
                        className="text-xs px-2 py-1 border border-gray-300 text-gray-600 hover:text-red-600 hover:border-red-500 rounded transition"
                        title="Delete workout"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {parts.map((sec, i) => (
                    <div key={i} className="mb-3">
                      {sec.title && <h6 className="font-medium mb-1">{sec.title}</h6>}
                      <ul className="text-sm space-y-1 text-gray-700">
                        {sec.items.map((item, j) => (
                          <li key={j} className="pl-2 border-l-4 border-blue-500">{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-500 mt-2">{dateText}</span>
              </div>
            </CardWrapper>
          );
        })}
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => page > 0 && router.push(`/workouts?page=${page - 1}`)}
          disabled={page === 0}
          className="px-5 py-2 bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => hasMore && router.push(`/workouts?page=${page + 1}`)}
          disabled={!hasMore}
          className="px-5 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {confirmDelete !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-sm">
            <h3 className="text-xl font-semibold text-center mb-4">Delete Workout?</h3>
            <p className="text-sm text-center text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
              >
                Cancel
              </button>
              <button
                onClick={deleteWorkout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

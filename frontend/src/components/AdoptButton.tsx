// src/components/AdoptButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AdoptButtonProps {
  workoutId: number;
  ownerId: number;
}

export default function AdoptButton({ workoutId, ownerId }: AdoptButtonProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((u: { id: number }) => setCurrentUserId(u.id))
      .catch(() => setCurrentUserId(null));
  }, []);

  if (currentUserId === ownerId) {
    return null;
  }

  const handleAdopt = async () => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }

    setStatus(null);
    try {
      const res = await fetch("/api/workouts/adopt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ workoutId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to adopt workout");
      }

      setStatus("✅ Workout adopted successfully! To unadopt, you may do so in the workout page.");
    } catch (e: unknown) {
      let message = "⚠️ Failed to adopt workout.";
      if (e instanceof Error) {
        message += ` ${e.message}`;
      }
      console.error(e);
      setStatus(message);
    }
  };

  if (currentUserId === null) return null;

  return (
    <div className="mt-4">
      <button
        onClick={handleAdopt}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Adopt this workout
      </button>
      {status && <p className="mt-2 text-sm text-gray-700">{status}</p>}
    </div>
  );
}

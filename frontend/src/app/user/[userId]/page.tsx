// src/app/user/[userId]/page.tsx

import { notFound } from "next/navigation";
import AdoptButton from "../../../components/AdoptButton";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  picture: string;
  created_at: string;
  main_workout: {
    id: number;
    name: string;
    plan_text: string;
    created_at: string;
  } | null;
}

export default async function Page(
  props: { params: Promise<{ userId: string }> }    // ← params is now a Promise
) {
  const { userId } = await props.params;             // ← await params before use

  const res = await fetch(`http://localhost:8000/user/${userId}`, {
    cache: "no-store",
  });
  if (!res.ok) return notFound();

  const user: UserProfile = await res.json();

  return (
    <article className="bg-white shadow rounded-lg p-6 border">
      <div className="flex items-center gap-6 mb-6">
        <img
          src={user.picture}
          alt={user.name}
          className="w-24 h-24 rounded-full"
        />
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-400">
            Joined: {new Date(user.created_at).toDateString()}
          </p>
        </div>
      </div>

      {user.main_workout ? (
        <section className="mt-4">
          <h2 className="text-2xl font-semibold mb-2">
            Main Workout: {user.main_workout.name}
          </h2>
          <p className="whitespace-pre-wrap">{user.main_workout.plan_text}</p>
          <p className="text-sm text-gray-400 mt-2">
            Created: {new Date(user.main_workout.created_at).toDateString()}
          </p>

          {/* Adopt button, hidden inside component if you’re the owner */}
          <AdoptButton
            workoutId={user.main_workout.id}
            ownerId={user.id}
          />
        </section>
      ) : (
        <p className="text-gray-500 italic">
          This user hasn’t set a main workout yet.
        </p>
      )}
    </article>
  );
}

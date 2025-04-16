export async function fetchCurrentUser() {
  try {
    const res = await fetch("http://localhost:8000/auth/me", {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
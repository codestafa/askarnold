'use client'

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl mb-6">Ask Arny</h1>
      <a
        href="http://localhost:8000/auth/google"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Sign in with Google
      </a>
    </div>
  );
}
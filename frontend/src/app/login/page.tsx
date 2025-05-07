'use client';

import Image from 'next/image';
import landingImage from '../../../public/landingpage.png';

export default function LoginPage() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* Left Side Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src={landingImage}
          alt="Fitness hero"
          layout="fill"
          objectFit="cover"
          className="rounded-r-lg"
          priority
        />
      </div>

      {/* Right Side Content */}
      <main className="flex-1 p-8 flex flex-col justify-center items-center text-center bg-gray-50">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Welcome to Ask Arny</h1>
        <p className="text-lg text-gray-700 max-w-xl mb-6">
          Your personalized fitness companion. Log in to access your workouts, chat with Arny, and connect with the community.
        </p>

        <button
          onClick={() => (window.location.href = 'http://localhost:8000/auth/google')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-8"
        >
          Login with Google
        </button>

        <div className="flex gap-4">
          <button
            disabled
            className="bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
          >
            Chat with Arny
          </button>
          <button
            disabled
            className="bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
          >
            View Workouts
          </button>
        </div>
      </main>
    </div>
  );
}

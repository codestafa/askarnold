import Image from "next/image";
import Sidebar from "../../stories/Sidebar";

export default function Settings() {
  const sections = [
    { name: "chat", icon: "M3 9.5L12 3l9 6.5v9.5a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H9v4a2 2 0 01-2 2H3a2 2 0 01-2-2V9.5z" },
    { name: "workouts", icon: "M15 12l-3-3m0 0l-3 3m3-3v12M5 12a7 7 0 0114 0v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4z" },
    { name: "community", icon: "M3 5a3 3 0 013-3h12a3 3 0 013 3v10a3 3 0 01-3 3H9l-6 3V5z" },
  ];

  const user = {
    name: "john doe",
    email: "johndoe@example.com",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
    bio: "Fitness enthusiast | Trainer | Helping people stay active",
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar sections={sections} user={{ name: "john doe" }} />

      <div className="flex flex-1 justify-center items-center p-6">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg flex flex-col items-center">
          <div className="relative w-28 h-28">
            <Image
              src={user.avatar}
              alt="User avatar"
              fill
              className="rounded-full border-4 border-gray-300 object-cover"
            />
          </div>

          <h2 className="text-2xl font-semibold mt-4">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-gray-500 text-center mt-2">{user.bio}</p>

          <div className="mt-6 flex gap-4 w-full">
            <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              Edit Profile
            </button>
            <button className="flex-1 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

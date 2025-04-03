import Sidebar from "../stories/Sidebar";

export default function Home() {
  const sections = [
    { name: "Chat with Arny", icon: "M3 9.5L12 3l9 6.5v9.5a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H9v4a2 2 0 01-2 2H3a2 2 0 01-2-2V9.5z" },
    { name: "View Workouts", icon: "M15 12l-3-3m0 0l-3 3m3-3v12M5 12a7 7 0 0114 0v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4z" },
    { name: "Community", icon: "M3 5a3 3 0 013-3h12a3 3 0 013 3v10a3 3 0 01-3 3H9l-6 3V5z" },
  ];

  return (
    <div className="flex">
      <Sidebar sections={sections} user={{ name: "John Doe" }} />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Welcome to Ask Arny</h1>
        <p className="mt-2 text-gray-600">Select an option from the sidebar.</p>
      </main>
    </div>
  );
}

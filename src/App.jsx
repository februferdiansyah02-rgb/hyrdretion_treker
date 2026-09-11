function App() {
  return (
    <div className="min-h-screen bg-blue-950 text-white">
      <nav className="p-5">
        <h1 className="text-2xl font-bold">💧 Hydration Tracker</h1>
      </nav>

      <main className="flex flex-col items-center justify-center px-6 py-20">
        <h2 className="text-4xl font-bold text-center">
          Stay Hydrated!
        </h2>

        <p className="mt-3 text-center text-blue-200">
          Track your daily water intake and build a healthy drinking habit.
        </p>

        <div className="mt-10 rounded-2xl bg-white p-8 text-center text-blue-950 shadow-lg">
          <p className="text-lg">Today's Water Intake</p>
          <p className="mt-2 text-4xl font-bold">0 ml</p>
          <p className="mt-2 text-gray-500">Target: 2000 ml</p>
        </div>
      </main>
    </div>
  )
}

export default App
export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center px-6 py-16 sm:px-20 sm:py-24 font-sans min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
      <main className="flex flex-col gap-6 row-start-2 items-center sm:items-start max-w-3xl text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Welcome to Happy Notes 📝</h1>
        <p className="text-lg sm:text-xl max-w-prose leading-relaxed text-gray-700 dark:text-gray-300">
          Your personal journaling space — simple, offline-friendly, and focused on your happiness.
          Reflect, write, and grow in your own private world.
        </p>
        <div className="flex gap-4 mt-6">
          <a
            href="/notes"
            className="bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-xl font-medium shadow hover:opacity-90 transition"
          >
            Start Writing
          </a>
          <a
            href="/about"
            className="underline underline-offset-4 text-black dark:text-white hover:opacity-80"
          >
            Learn More
          </a>
        </div>
      </main>
    </div>
  );
}

import SvgConverter from "./components/SvgConverter";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
              SVG to React / React Native Converter
            </h1>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-6xl mx-auto px-6 mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Convert SVG to Code
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl">
            Instantly convert your SVG icons into clean React and React Native
            components. Optimized for production use with automatic formatting.
          </p>
        </div>

        <SvgConverter />
      </main>
    </div>
  );
}

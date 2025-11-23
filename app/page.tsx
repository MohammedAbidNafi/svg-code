import Image from "next/image";
import SvgConverter from "./components/SvgConverter";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/image.png"
              alt="SVG Code Logo"
              width={64}
              height={64}
              className="w-16 h-16"
            />
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
              SVG to React / React Native Component Converter
            </h1>
          </div>
          <a
            href="https://github.com/MohammedAbidNafi/svg-code"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      <main className="py-8 flex-1">
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

      <footer className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800">
        <p>
          Created by{" "}
          <a
            href="https://abidnafi.com"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
          >
            Abid Nafi
          </a>{" "}
          • Licensed under GPL 3.0
        </p>
        <p className="mt-2">
          Logo Designed by{" "}
          <a
            href="https://afzal.live"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
          >
            Afzal Hashmi
          </a>
        </p>
      </footer>
    </div>
  );
}

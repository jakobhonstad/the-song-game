import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white/80 hover:text-white text-sm transition-colors"
        >
          ← Hjem
        </Link>
      </div>
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 text-white">
        <div className="text-center space-y-6">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 animate-pulse-slow">
            🎵 The Song Game
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            Test dine musikkkunnskaper i dette multiplayer quiz-spillet!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link
              href="/create"
              className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg"
            >
              Opprett Spill
            </Link>
            
            <Link
              href="/join"
              className="px-8 py-4 bg-purple-600/50 text-white rounded-xl font-bold text-lg hover:bg-purple-600/70 transition-all transform hover:scale-105 shadow-lg border-2 border-white/30"
            >
              Bli med i Spill
            </Link>
          </div>
          
          <div className="mt-16 text-white/70 text-sm">
            <p>Hvordan spille:</p>
            <ol className="mt-4 space-y-2 text-left max-w-md mx-auto">
              <li>1. Velg en kategori (Film, TV-serier, etc.)</li>
              <li>2. Del spillkoden med venner</li>
              <li>3. Gjett temalåter så fort du kan</li>
              <li>4. Den med flest poeng vinner! 🏆</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}

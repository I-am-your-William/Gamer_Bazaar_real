export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-deep-black">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-electric mb-4">404</h1>
        <p className="text-xl text-gray-300 mb-8">Page not found</p>
        <a 
          href="/" 
          className="bg-electric hover:bg-electric/80 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
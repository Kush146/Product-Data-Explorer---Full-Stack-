export default function NotFound() {
  return (
    <div className="min-h-[50vh] grid place-items-center">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-gray-600">The page you’re looking for doesn’t exist.</p>
        <a href="/" className="inline-flex items-center rounded border px-3 py-1.5 hover:shadow">
          Go home
        </a>
      </div>
    </div>
  );
}

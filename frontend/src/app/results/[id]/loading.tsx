export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center animate-pulse">
      <div className="max-w-4xl w-full">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <div className="h-8 w-64 bg-slate-800 rounded mb-2"></div>
            <div className="h-4 w-48 bg-slate-800 rounded"></div>
          </div>
          <div className="h-10 w-40 bg-slate-800 rounded-full"></div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-panel p-8 rounded-2xl md:col-span-1 h-64 bg-slate-800/50"></div>
          <div className="glass-panel p-6 rounded-2xl md:col-span-2 flex flex-col gap-6 bg-slate-800/50">
            <div className="h-16 bg-slate-800 rounded"></div>
            <div className="h-16 bg-slate-800 rounded"></div>
            <div className="h-16 bg-slate-800 rounded"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="glass-panel p-6 rounded-2xl h-48 bg-slate-800/50"></div>
          <div className="glass-panel p-6 rounded-2xl h-48 bg-slate-800/50"></div>
        </div>
      </div>
    </div>
  );
}

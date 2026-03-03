import BottomNav from "../components/ui/BottomNav";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-white pb-16 max-w-[420px] mx-auto">
      <header className="p-4 border-b border-slate-800">
        <h1 className="text-xl font-semibold">📿 Ibadah</h1>
      </header>

      <main className="p-4">
        <p className="text-slate-400">Checklist ibadah & dzikir akan di sini</p>
      </main>

      <BottomNav />
    </div>
  );
}

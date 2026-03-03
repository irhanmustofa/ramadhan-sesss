import BottomNav from "../../components/ui/BottomNav";
import SurahList from "./SurahList";

export default function QuranHome() {
  return (
    <div className="px-4 pt-6 pb-24 space-y-6 max-w-2xl mx-auto">
      <div>
        <header className="space-y-1">
          <SurahList />
        </header>
      </div>
    </div>
  );
}

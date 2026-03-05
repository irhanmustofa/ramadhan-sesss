import RamadhanCalendar from "./Elements/RamadhanCalendar";
import RamadhanToday from "./Elements/RamadhanToday";

export default function RamadhanHome() {
  return (
    <div className="max-w-xl mx-auto">
      <RamadhanCalendar />
      <RamadhanToday />
    </div>
  );
}

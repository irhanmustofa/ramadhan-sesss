export default function AudioPlayer({ audioUrl }) {
  if (!audioUrl) return null;

  return (
    <audio controls preload="none" className="w-full mt-2">
      <source src={audioUrl} type="audio/mpeg" />
    </audio>
  );
}

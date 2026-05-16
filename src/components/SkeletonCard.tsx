export default function SkeletonCard() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <div className="h-4 w-48 bg-zinc-800 rounded" />
        <div className="h-4 w-12 bg-zinc-800 rounded" />
      </div>
      <div className="h-3 w-full bg-zinc-800 rounded" />
      <div className="h-3 w-3/4 bg-zinc-800 rounded" />
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-zinc-800 rounded-full" />
        <div className="h-5 w-20 bg-zinc-800 rounded-full" />
      </div>
      <div className="space-y-2 pt-1 border-t border-zinc-800">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 w-32 bg-zinc-800 rounded" />
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

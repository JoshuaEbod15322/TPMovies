export function MediaCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 animate-pulse w-full">
      <div className="w-full aspect-[2/3] bg-[#0d0d0d] border border-white/5 rounded-xl"></div>
      <div className="h-4 bg-[#0d0d0d] rounded w-3/4"></div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-[#0d0d0d] rounded w-1/3"></div>
        <div className="h-3 bg-[#0d0d0d] rounded w-1/4"></div>
      </div>
    </div>
  );
}

export function MediaRowSkeleton({ title }: { title?: string }) {
  return (
    <div className="my-8 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      {title && <div className="h-7 w-48 bg-[#0d0d0d] rounded-md mb-4 animate-pulse"></div>}
      <div className="app-media-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
        {Array.from({ length: 15 }).map((_, i) => (
          <MediaCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="app-hero-skeleton w-full h-[70vh] min-h-[500px] bg-[#0d0d0d] animate-pulse relative flex items-end pb-16 px-6 sm:px-12">
      <div className="max-w-3xl w-full flex flex-col gap-4 z-10">
        <div className="h-6 w-32 bg-white/5 rounded-full"></div>
        <div className="h-12 w-3/4 bg-white/5 rounded-lg"></div>
        <div className="h-4 w-full bg-white/5 rounded"></div>
        <div className="h-4 w-2/3 bg-white/5 rounded"></div>
        <div className="flex gap-4 mt-2">
          <div className="h-12 w-36 bg-white/5 rounded-lg"></div>
          <div className="h-12 w-36 bg-white/5 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div className="min-h-screen bg-[#050505] pt-20 pb-16 animate-pulse">
      <div className="h-[45vh] bg-[#0d0d0d] w-full mb-8 relative"></div>
      <div className="app-details-layout max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="w-full aspect-[2/3] bg-[#0d0d0d] rounded-2xl border border-white/5"></div>
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="h-10 bg-[#0d0d0d] rounded-lg w-3/4"></div>
          <div className="h-5 bg-[#0d0d0d] rounded w-1/3"></div>
          <div className="h-20 bg-[#0d0d0d] rounded-xl w-full mt-4"></div>
          <div className="h-12 bg-[#0d0d0d] rounded-xl w-48 mt-4"></div>
        </div>
      </div>
    </div>
  );
}

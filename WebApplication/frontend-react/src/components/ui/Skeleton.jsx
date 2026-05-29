const Skeleton = ({ className = '', rounded = 'rounded-xl' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] ${rounded} ${className}`} />
);

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        className={`h-3 ${index === lines - 1 ? 'w-2/3' : 'w-full'}`}
        rounded="rounded-full"
      />
    ))}
  </div>
);

export const SkeletonAvatar = ({ size = 'h-16 w-16', className = '' }) => (
  <Skeleton className={`${size} shrink-0 ${className}`} rounded="rounded-full" />
);

export const SkeletonCard = ({ className = '', children }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 ${className}`}>
    {children || (
      <>
        <div className="flex items-center gap-4">
          <SkeletonAvatar size="h-12 w-12" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" rounded="rounded-full" />
            <Skeleton className="h-3 w-1/3" rounded="rounded-full" />
          </div>
        </div>
        <SkeletonText lines={3} />
      </>
    )}
  </div>
);

export const HistorySkeleton = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-3 w-24" rounded="rounded-full" />
            <Skeleton className="h-5 w-56 max-w-full" rounded="rounded-full" />
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-3 w-28" rounded="rounded-full" />
              <Skeleton className="h-3 w-24" rounded="rounded-full" />
              <Skeleton className="h-3 w-24" rounded="rounded-full" />
            </div>
          </div>
          <Skeleton className="h-12 w-20" rounded="rounded-xl" />
        </div>
      </SkeletonCard>
    ))}
  </div>
);

export const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-8">
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
      <div className="bg-[#E0F2FE]/40 p-8 flex items-center gap-5 border-b border-slate-100">
        <SkeletonAvatar size="h-20 w-20" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-48 max-w-full" rounded="rounded-full" />
          <Skeleton className="h-4 w-64 max-w-full" rounded="rounded-full" />
        </div>
      </div>
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-40" rounded="rounded-full" />
          <Skeleton className="h-10 w-28" rounded="rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-24" rounded="rounded-full" />
              <Skeleton className="h-4 w-48 max-w-full" rounded="rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);

export const AnalysisResultSkeleton = () => (
  <div className="max-w-5xl mx-auto space-y-8">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-3 flex-1">
        <Skeleton className="h-8 w-80 max-w-full" rounded="rounded-full" />
        <Skeleton className="h-4 w-64 max-w-full" rounded="rounded-full" />
      </div>
      <Skeleton className="h-10 w-36" rounded="rounded-full" />
    </div>
    <SkeletonCard className="bg-[#004A7C] border-[#004A7C]">
      <div className="flex flex-col md:flex-row gap-6">
        <Skeleton className="h-24 w-36 bg-white/20" rounded="rounded-2xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-32 bg-white/20" rounded="rounded-full" />
          <Skeleton className="h-8 w-72 max-w-full bg-white/20" rounded="rounded-full" />
          <Skeleton className="h-4 w-full bg-white/20" rounded="rounded-full" />
        </div>
      </div>
    </SkeletonCard>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SkeletonCard />
      <SkeletonCard />
    </div>
    <SkeletonCard />
    <SkeletonCard />
  </div>
);

export default Skeleton;


import React from 'react';
interface LoaderProps {
  loaderType?: string;
}
export const Loader: React.FC<LoaderProps> = ({ loaderType }) => {
  return (
    <>

      {loaderType === 'shimmerSkeleton' && <div className="w-full p-2 space-y-8">
        {[1, 2].map((item) => (
          <div key={item} className="w-full">
            {/* Skeleton item with shimmer effect */}
            <div className="relative overflow-hidden">
              {/* Shimmer overlay */}
              <div className="absolute inset-0 -translate-x-full z-10 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

              {/* Content skeleton */}
              <div className="mb-1">
                <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded-md w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded-md w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded-md w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded-md w-4/5"></div>
              </div>
            </div>
          </div>
        ))}
      </div>}

      {loaderType === 'cardLoader' && <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2 w-full max-w-7xl px-2">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-[10px] p-1 transition duration-300"
          >
            <div className="bg-gray-200 h-16 w-full rounded-md mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>}

      {loaderType === 'hoverLoader' && <div className="w-full p-4 space-y-8">
        {/* First card */}
        <div className="w-full">
          <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-4 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded-md w-full mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded-md w-full mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded-md w-full mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded-md w-4/5 animate-pulse"></div>
        </div>

        {/* Second card */}
        <div className="w-full">
          <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-4 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded-md w-full mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded-md w-full mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded-md w-full mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded-md w-4/5 animate-pulse"></div>
        </div>

        {/* Third card */}
        <div className="w-full">
          <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-4 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded-md w-full mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded-md w-full mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded-md w-full mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded-md w-4/5 animate-pulse"></div>
        </div>
      </div>}

      {loaderType === 'cardSkeletonLoader' && <div className="max-w-2xl mx-auto">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md p-4 flex items-start gap-4"
          >
            {/* Left square placeholder */}
            <div className="w-24 h-24 bg-gray-200 rounded-md flex-shrink-0"></div>

            {/* Right content area */}
            <div className="flex-1 space-y-2">
              {/* Title placeholder */}
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-1"></div>

              {/* Long text placeholder */}
              <div className="h-3 bg-gray-200 rounded w-full"></div>

              {/* Medium text placeholder */}
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>

              {/* Short text placeholder */}
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}

      </div>}

      {loaderType === 'blockSkeleton' && <div className="max-w-md mx-auto p-4">
        <div className="space-y-4">
          {/* Larger rectangular block with pulse animation */}
          <div className="h-36 bg-gray-200 rounded-md w-full animate-pulse"></div>

          {/* Four equal-sized lines with pulse animation */}
          <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
        </div>
      </div>}
      {loaderType === 'wideBanner' && <div className="w-full max-w-5xl mx-auto p-4">
        {[1, 2].map((item) => (
          <div className="space-y-3">
            {/* Wide top banner with pulse animation */}
            <div className="h-12 bg-gray-200 rounded w-full mb-4 animate-pulse"></div>

            {/* Four equal-sized lines with pulse animation */}
            <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
        ))}

      </div>}
    </>
  );
};


import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl px-2">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-[10px] p-4 shadow-md hover:shadow-lg transition duration-300"
          >
            <div className="bg-gray-200 h-16 w-full rounded-md mb-3"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
  );
};

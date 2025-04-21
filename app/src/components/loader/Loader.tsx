
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="c-loader flex justify-center items-center">
      <div className="lds-roller">
        {[...Array(8)].map((_, i) => (
          <div key={i} />
        ))}
      </div>
    </div>
  );
};

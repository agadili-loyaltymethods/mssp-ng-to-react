import React from 'react';

export const CardSkeleton: React.FC = () => {
  const renderCard = () => (
    <div className="card">
      <div className="card-img skeleton">
        {/* waiting for img to load from javascript */}
      </div>
      <div className="card-body">
        <h2 className="card-title skeleton">
          {/* waiting for title to load from javascript */}
        </h2>
        <p className="card-intro skeleton">
          {/* waiting for intro to load from Javascript */}
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-row items-center justify-between">
      {[1, 2, 3, 4].map((key) => (
        <div key={key} className="container">
          {renderCard()}
        </div>
      ))}
    </div>
  );
};
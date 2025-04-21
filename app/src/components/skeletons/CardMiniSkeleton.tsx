import React from 'react';

export const CardMiniSkeleton: React.FC = () => {
  const renderSkeletonBox = () => (
    <div className="skeleton">
      <div className="skeleton-left flex1">
        <div className="square"></div>
      </div>
      <div className="skeleton-right flex2">
        <div className="line h17 w40 m10"></div>
        <div className="line"></div>
        <div className="line h8 w50"></div>
        <div className="line w75"></div>
      </div>
    </div>
  );

  return (
    <>
      <div className="box flex flex-row w-full gap-5">
        {[1, 2, 3, 4].map((key) => (
          <div key={key} className="skeleton">
            {renderSkeletonBox()}
          </div>
        ))}
      </div>
      <div className="box flex flex-row w-full mt-5 gap-5">
        {[1, 2, 3, 4].map((key) => (
          <div key={key} className="skeleton">
            {renderSkeletonBox()}
          </div>
        ))}
      </div>
    </>
  );
};
import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

/**
 * Skeleton component built in accordance with UIAble & shadcn specifications.
 * Renders an accessible placeholder with low-CPU CSS pulse or metallic shimmer animation
 * that seamlessly adapts between Light and Dark mode.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  shimmer = true,
  ...props
}) => {
  return (
    <div
      className={`skeleton-box rounded-md ${
        shimmer ? "skeleton-shimmer" : "animate-pulse"
      } ${className}`}
      {...props}
    />
  );
};

export default Skeleton;

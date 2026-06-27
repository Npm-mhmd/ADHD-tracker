import React from 'react';
import { styleFor } from '../../constants/categories';

// A 5-segment meter that reads an observation's intensity at a glance.
// Filled segments take the category's color; the rest stay neutral.
const IntensityMeter = ({ value, category, size = 'md' }) => {
  const filled = Math.max(0, Math.min(5, Number(value) || 0));
  const fillClass = styleFor(category).dot;
  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-2.5' };

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`Intensity ${filled} of 5`}
    >
      {[1, 2, 3, 4, 5].map((segment) => (
        <span
          key={segment}
          className={`${heights[size]} w-5 rounded-full transition-colors ${
            segment <= filled ? fillClass : 'bg-sand-200 dark:bg-night-600'
          }`}
        />
      ))}
    </div>
  );
};

export default IntensityMeter;

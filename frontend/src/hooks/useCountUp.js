import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for animating numbers from 0 to target value
 * @param {number} end - Target number
 * @param {number} duration - Animation duration in milliseconds
 * @param {boolean} shouldStart - Whether to start the animation
 * @returns {number} - Current animated value
 */
export const useCountUp = (end, duration = 2000, shouldStart = false) => {
  const [count, setCount] = useState(0);
  const hasAnimatedRef = useRef(false);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!shouldStart || hasAnimatedRef.current) {
      return;
    }

    console.log(`Starting counter animation to ${end}`);
    hasAnimatedRef.current = true;

    // Small delay to ensure the component is visible
    const startDelay = setTimeout(() => {
      startTimeRef.current = null;

      const animate = (timestamp) => {
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp;
        }

        const progress = timestamp - startTimeRef.current;
        const percentage = Math.min(progress / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - percentage, 3);
        const currentCount = Math.floor(easeOut * end);

        setCount(currentCount);

        if (percentage < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          setCount(end);
          console.log(`Counter animation complete: ${end}`);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(startDelay);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [end, duration, shouldStart]);

  return count;
};

/**
 * Format number with K/M suffix
 */
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toString();
};

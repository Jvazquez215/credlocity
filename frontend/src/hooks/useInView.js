import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to detect when an element is in viewport
 * @param {Object} options - Intersection Observer options
 * @returns {Array} - [ref, isInView]
 */
export const useInView = (options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px',
    once: true
  };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observerOptions = {
      ...defaultOptions,
      ...options
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Optionally unobserve after first intersection
          if (observerOptions.once) {
            observer.unobserve(element);
          }
        } else if (!observerOptions.once) {
          setIsInView(false);
        }
      },
      {
        threshold: observerOptions.threshold,
        rootMargin: observerOptions.rootMargin
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []); // Remove dependencies to avoid re-creating observer

  return [ref, isInView];
};

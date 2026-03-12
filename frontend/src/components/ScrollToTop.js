import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component - scrolls to top on route change
 * Fixes the issue where clicking footer links keeps users at the bottom
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top immediately on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use instant for immediate scroll, or 'smooth' for animated
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;

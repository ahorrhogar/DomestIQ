import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '');
      const target = document.getElementById(targetId);

      if (target) {
        const stickyHeaderOffset = 96;
        const top = target.getBoundingClientRect().top + window.scrollY - stickyHeaderOffset;
        window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
        return;
      }
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;

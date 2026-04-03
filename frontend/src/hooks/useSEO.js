import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const API = process.env.REACT_APP_BACKEND_URL;

/**
 * Hook to fetch SEO metadata + auto-generated JSON-LD schemas for the current page.
 * Injects schema <script> tags into <head> and returns SEO metadata.
 */
const useSEO = (defaults = {}) => {
  const location = useLocation();
  const [seo, setSeo] = useState(defaults);

  useEffect(() => {
    const path = location.pathname;

    // Fetch page SEO metadata
    fetch(`${API}/api/seo/pages/by-path?path=${encodeURIComponent(path)}`)
      .then(r => r.json())
      .then(data => {
        if (data.title) {
          setSeo(prev => ({
            title: data.title || prev.title || defaults.title,
            description: data.description || prev.description || defaults.description,
            keywords: data.keywords || prev.keywords || defaults.keywords || '',
            og_title: data.og_title || data.title || prev.title || defaults.title,
            og_description: data.og_description || data.description || prev.description || defaults.description,
            og_image: data.og_image || defaults.og_image || '',
            canonical_url: data.canonical_url || `${window.location.origin}${path}`,
            robots_meta: data.robots_meta || defaults.robots_meta || 'index, follow',
            schema_json: data.schema_json || defaults.schema_json || '',
          }));
        }
      })
      .catch(() => {});

    // Fetch and inject JSON-LD schemas
    fetch(`${API}/api/seo/page-schemas?path=${encodeURIComponent(path)}`)
      .then(r => r.json())
      .then(data => {
        // Remove previously injected schemas
        document.querySelectorAll('script[data-schema-auto]').forEach(el => el.remove());

        if (data.schemas && Array.isArray(data.schemas)) {
          data.schemas.forEach((schema, i) => {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.setAttribute('data-schema-auto', `schema-${i}`);
            script.textContent = JSON.stringify(schema);
            document.head.appendChild(script);
          });
        }
      })
      .catch(() => {});

    // Cleanup on unmount or path change
    return () => {
      document.querySelectorAll('script[data-schema-auto]').forEach(el => el.remove());
    };
  }, [location.pathname]);

  return seo;
};

export default useSEO;

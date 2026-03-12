import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import PageRenderer from '../components/PageRenderer';

/**
 * DynamicPage - Renders any page that has been built with the visual page builder
 * Falls back to showing "Page not found" if no layout exists
 */
const DynamicPage = ({ slug, fallbackContent }) => {
  const [layoutData, setLayoutData] = useState(null);
  const [hasLayout, setHasLayout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState(null);
  const location = useLocation();

  // Determine the slug to use
  const pageSlug = slug || location.pathname.replace(/^\//, '') || 'home';

  useEffect(() => {
    loadPageLayout();
  }, [pageSlug]);

  const loadPageLayout = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/page-builder/render/${pageSlug}`);
      
      if (response.data.has_layout) {
        setHasLayout(true);
        setLayoutData(response.data.layout_data);
        setPageData(response.data.page);
      } else {
        setHasLayout(false);
        setPageData(response.data.page);
      }
    } catch (err) {
      console.error('Error loading page layout:', err);
      setHasLayout(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // If page builder layout exists, render it
  if (hasLayout && layoutData) {
    return (
      <div className="min-h-screen">
        <PageRenderer 
          components={layoutData.components || []} 
          settings={layoutData.settings || {}} 
        />
      </div>
    );
  }

  // Otherwise, render fallback content (original static page)
  if (fallbackContent) {
    return fallbackContent;
  }

  // If no fallback and no layout, show nothing (page not found will be handled by routing)
  return null;
};

export default DynamicPage;

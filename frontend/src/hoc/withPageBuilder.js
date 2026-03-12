import React from 'react';
import DynamicPage from '../pages/DynamicPage';

/**
 * Higher Order Component to wrap static pages with page builder functionality
 * 
 * Usage: export default withPageBuilder(MyComponent, 'page-slug');
 * 
 * This allows any page to be edited with the visual page builder while
 * maintaining backward compatibility with static content
 */
const withPageBuilder = (Component, pageSlug) => {
  return (props) => {
    const StaticContent = <Component {...props} />;
    
    return (
      <DynamicPage 
        slug={pageSlug} 
        fallbackContent={StaticContent} 
      />
    );
  };
};

export default withPageBuilder;

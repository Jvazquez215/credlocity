import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Info, Check, X } from 'lucide-react';

// All available schema types with descriptions
const ALL_SCHEMA_TYPES = {
  // Article/Content schemas
  Article: {
    label: 'Article',
    description: 'Generic article content',
    category: 'Content',
    defaultFor: ['blog']
  },
  NewsArticle: {
    label: 'News Article',
    description: 'News and press-related content',
    category: 'Content',
    defaultFor: ['press_release', 'announcement']
  },
  BlogPosting: {
    label: 'Blog Posting',
    description: 'Blog posts and articles',
    category: 'Content',
    defaultFor: ['blog']
  },

  // Business schemas
  LocalBusiness: {
    label: 'Local Business',
    description: 'Physical business location with address',
    category: 'Business',
    defaultFor: ['about', 'contact', 'home']
  },
  Organization: {
    label: 'Organization',
    description: 'Company/organization information',
    category: 'Business',
    defaultFor: ['about', 'home', 'team']
  },
  ProfessionalService: {
    label: 'Professional Service',
    description: 'Professional service provider',
    category: 'Business',
    defaultFor: ['services', 'pricing']
  },
  LegalService: {
    label: 'Legal Service',
    description: 'Legal and attorney services',
    category: 'Business',
    defaultFor: ['attorney', 'services', 'lawsuit']
  },

  // Service schemas
  Service: {
    label: 'Service',
    description: 'A service offering',
    category: 'Services',
    defaultFor: ['services', 'pricing']
  },
  Product: {
    label: 'Product',
    description: 'A product offering',
    category: 'Services',
    defaultFor: ['pricing']
  },

  // Review schemas
  Review: {
    label: 'Review',
    description: 'Individual review',
    category: 'Reviews',
    defaultFor: ['review', 'testimonial']
  },
  AggregateRating: {
    label: 'Aggregate Rating',
    description: 'Average rating from multiple reviews',
    category: 'Reviews',
    defaultFor: ['reviews', 'services']
  },

  // Educational schemas
  EducationalOrganization: {
    label: 'Educational Organization',
    description: 'Educational institution',
    category: 'Educational',
    defaultFor: []
  },
  Course: {
    label: 'Course',
    description: 'Educational course or training',
    category: 'Educational',
    defaultFor: ['course', 'training']
  },

  // FAQ/How-to schemas
  FAQPage: {
    label: 'FAQ Page',
    description: 'Frequently asked questions page',
    category: 'Support',
    defaultFor: ['faq']
  },
  HowTo: {
    label: 'How To',
    description: 'Step-by-step instructions',
    category: 'Support',
    defaultFor: ['guide', 'tutorial', 'blog']
  },

  // Media schemas
  VideoObject: {
    label: 'Video Object',
    description: 'Video content',
    category: 'Media',
    defaultFor: []
  },
  ImageObject: {
    label: 'Image Object',
    description: 'Image content with metadata',
    category: 'Media',
    defaultFor: []
  },

  // Navigation/Structure schemas
  BreadcrumbList: {
    label: 'Breadcrumb',
    description: 'Navigation breadcrumb trail',
    category: 'Navigation',
    defaultFor: ['blog', 'press_release', 'announcement', 'lawsuit', 'page']
  },
  WebPage: {
    label: 'Web Page',
    description: 'Generic web page',
    category: 'Navigation',
    defaultFor: ['page']
  },
  WebSite: {
    label: 'Web Site',
    description: 'Website information',
    category: 'Navigation',
    defaultFor: ['home']
  },

  // Event schemas
  Event: {
    label: 'Event',
    description: 'An event or happening',
    category: 'Events',
    defaultFor: ['event', 'webinar']
  },

  // Person schemas
  Person: {
    label: 'Person',
    description: 'Individual person profile',
    category: 'People',
    defaultFor: ['team', 'author', 'partner']
  },

  // Legal-specific schemas
  LegalCase: {
    label: 'Legal Case',
    description: 'Court case or lawsuit information',
    category: 'Legal',
    defaultFor: ['lawsuit']
  }
};

// Content type to default schemas mapping
const CONTENT_TYPE_DEFAULTS = {
  blog: ['Article', 'BlogPosting', 'BreadcrumbList', 'Organization'],
  press_release: ['NewsArticle', 'BreadcrumbList', 'Organization', 'LocalBusiness'],
  announcement: ['NewsArticle', 'BreadcrumbList', 'Organization'],
  lawsuit: ['LegalCase', 'LegalService', 'BreadcrumbList', 'Organization'],
  page: ['WebPage', 'BreadcrumbList', 'Organization', 'LocalBusiness'],
  faq: ['FAQPage', 'BreadcrumbList', 'Organization'],
  services: ['Service', 'ProfessionalService', 'AggregateRating', 'Organization', 'LocalBusiness'],
  pricing: ['Product', 'Service', 'ProfessionalService', 'Organization'],
  team: ['Person', 'Organization', 'BreadcrumbList'],
  reviews: ['Review', 'AggregateRating', 'Organization', 'LocalBusiness'],
  home: ['WebSite', 'Organization', 'LocalBusiness', 'ProfessionalService'],
  about: ['Organization', 'LocalBusiness', 'ProfessionalService'],
  contact: ['LocalBusiness', 'Organization'],
  partner: ['Person', 'Organization', 'LocalBusiness', 'ProfessionalService', 'Review', 'BreadcrumbList']
};

const SchemaSelector = ({ 
  value = [], 
  onChange, 
  contentType = 'page',
  className = '' 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedSchemas, setSelectedSchemas] = useState([]);

  // Get default schemas for this content type
  const defaultSchemas = CONTENT_TYPE_DEFAULTS[contentType] || CONTENT_TYPE_DEFAULTS.page;

  // Initialize with defaults or value
  useEffect(() => {
    if (value && value.length > 0) {
      setSelectedSchemas(value);
    } else if (defaultSchemas.length > 0) {
      setSelectedSchemas(defaultSchemas);
      if (onChange) {
        onChange(defaultSchemas);
      }
    }
  }, [contentType]);

  const handleToggleSchema = (schemaType) => {
    const newSelection = selectedSchemas.includes(schemaType)
      ? selectedSchemas.filter(s => s !== schemaType)
      : [...selectedSchemas, schemaType];
    
    setSelectedSchemas(newSelection);
    if (onChange) {
      onChange(newSelection);
    }
  };

  const handleSelectAll = (category) => {
    const categorySchemas = Object.entries(ALL_SCHEMA_TYPES)
      .filter(([_, schema]) => schema.category === category)
      .map(([type]) => type);
    
    const allSelected = categorySchemas.every(s => selectedSchemas.includes(s));
    
    let newSelection;
    if (allSelected) {
      newSelection = selectedSchemas.filter(s => !categorySchemas.includes(s));
    } else {
      newSelection = [...new Set([...selectedSchemas, ...categorySchemas])];
    }
    
    setSelectedSchemas(newSelection);
    if (onChange) {
      onChange(newSelection);
    }
  };

  const handleResetToDefaults = () => {
    setSelectedSchemas(defaultSchemas);
    if (onChange) {
      onChange(defaultSchemas);
    }
  };

  // Group schemas by category
  const schemasByCategory = Object.entries(ALL_SCHEMA_TYPES).reduce((acc, [type, schema]) => {
    if (!acc[schema.category]) {
      acc[schema.category] = [];
    }
    acc[schema.category].push({ type, ...schema });
    return acc;
  }, {});

  const categories = Object.keys(schemasByCategory);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Schema.org Structured Data
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Select schema types to enhance SEO. {selectedSchemas.length} selected
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="text-xs text-blue-600 hover:text-blue-700 underline"
          >
            Reset to defaults
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {expanded ? 'Collapse' : 'Expand All'}
          </button>
        </div>
      </div>

      {/* Selected Schemas Summary */}
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg min-h-[48px]">
        {selectedSchemas.length > 0 ? selectedSchemas.map(schema => (
          <span
            key={schema}
            className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium"
          >
            <Check size={12} />
            {ALL_SCHEMA_TYPES[schema]?.label || schema}
            <button
              type="button"
              onClick={() => handleToggleSchema(schema)}
              className="ml-1 hover:text-green-900 hover:bg-green-200 rounded-full p-0.5"
            >
              <X size={12} />
            </button>
          </span>
        )) : (
          <span className="text-xs text-gray-400 italic">No schemas selected - click Expand to add</span>
        )}
      </div>

      {/* Default Indicator */}
      <div className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
        <Info size={14} className="flex-shrink-0 mt-0.5 text-blue-500" />
        <span>
          <strong className="text-blue-700">Recommended for {contentType}:</strong>{' '}
          <span className="text-blue-600">{defaultSchemas.map(s => ALL_SCHEMA_TYPES[s]?.label || s).join(', ')}</span>
        </span>
      </div>

      {/* Expanded Schema Selection */}
      {expanded && (
        <div className="border rounded-lg overflow-hidden shadow-sm">
          {categories.map((category, idx) => {
            const categorySchemas = schemasByCategory[category];
            const selectedInCategory = categorySchemas.filter(s => selectedSchemas.includes(s.type)).length;
            
            return (
              <div key={category} className={idx > 0 ? 'border-t' : ''}>
                {/* Category Header */}
                <div 
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSelectAll(category)}
                >
                  <span className="font-medium text-sm text-gray-700">{category}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedInCategory === categorySchemas.length 
                        ? 'bg-green-100 text-green-700' 
                        : selectedInCategory > 0 
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-200 text-gray-500'
                    }`}>
                      {selectedInCategory}/{categorySchemas.length}
                    </span>
                    <span className="text-xs text-blue-600 hover:text-blue-700">
                      {selectedInCategory === categorySchemas.length ? 'Deselect all' : 'Select all'}
                    </span>
                  </div>
                </div>

                {/* Category Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-white">
                  {categorySchemas.map(schema => {
                    const isDefault = defaultSchemas.includes(schema.type);
                    const isSelected = selectedSchemas.includes(schema.type);

                    return (
                      <div
                        key={schema.type}
                        onClick={() => handleToggleSchema(schema.type)}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition border-2 ${
                          isSelected 
                            ? 'bg-green-50 border-green-300 hover:bg-green-100' 
                            : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'bg-green-500 text-white' : 'bg-gray-200'
                        }`}>
                          {isSelected && <Check size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-medium ${isSelected ? 'text-green-800' : 'text-gray-800'}`}>
                              {schema.label}
                            </span>
                            {isDefault && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded font-medium">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {schema.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export { SchemaSelector, ALL_SCHEMA_TYPES, CONTENT_TYPE_DEFAULTS };
export default SchemaSelector;

import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../../utils/api';

const SchemaPanel = ({ pageId, pageData }) => {
  const [schemas, setSchemas] = useState([]);
  const [expandedSchema, setExpandedSchema] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pageData?.schemas) {
      setSchemas(pageData.schemas);
    }
  }, [pageData]);

  const schemaTemplates = {
    author: {
      '@type': 'Person',
      name: '',
      url: '',
      image: '',
      sameAs: []
    },
    page: {
      '@type': 'WebPage',
      name: '',
      description: '',
      url: ''
    },
    organization: {
      '@type': 'Organization',
      name: 'Credlocity',
      url: 'https://credlocity.com',
      logo: '',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '',
        contactType: 'customer service'
      },
      sameAs: []
    },
    faq: {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '',
          acceptedAnswer: {
            '@type': 'Answer',
            text: ''
          }
        }
      ]
    },
    review: {
      '@type': 'Review',
      itemReviewed: {
        '@type': 'Service',
        name: ''
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5'
      },
      author: {
        '@type': 'Person',
        name: ''
      },
      reviewBody: ''
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://credlocity.com'
        }
      ]
    },
    localBusiness: {
      '@type': 'LocalBusiness',
      name: 'Credlocity',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '',
        addressLocality: '',
        addressRegion: '',
        postalCode: '',
        addressCountry: 'US'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '',
        longitude: ''
      },
      telephone: '',
      openingHours: ''
    },
    service: {
      '@type': 'Service',
      serviceType: '',
      provider: {
        '@type': 'Organization',
        name: 'Credlocity'
      },
      areaServed: 'United States',
      description: ''
    },
    video: {
      '@type': 'VideoObject',
      name: '',
      description: '',
      thumbnailUrl: '',
      uploadDate: '',
      contentUrl: '',
      embedUrl: '',
      duration: ''
    }
  };

  const addSchema = (type) => {
    const newSchema = {
      id: Date.now().toString(),
      type,
      data: {
        '@context': 'https://schema.org',
        ...schemaTemplates[type]
      }
    };
    setSchemas([...schemas, newSchema]);
    setExpandedSchema(newSchema.id);
  };

  const removeSchema = (id) => {
    setSchemas(schemas.filter(s => s.id !== id));
  };

  const updateSchema = (id, data) => {
    setSchemas(schemas.map(s => s.id === id ? { ...s, data } : s));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await api.put(`/pages/${pageId}`, {
        schemas: schemas
      });

      console.log('Schemas saved:', response.data);
      alert(`✅ Schema data saved successfully! ${schemas.length} schema(s) are now active on this page.`);
    } catch (err) {
      console.error('Error saving schemas:', err);
      alert('❌ Error saving schema data');
    } finally {
      setSaving(false);
    }
  };

  const renderSchemaEditor = (schema) => {
    return (
      <div key={schema.id} className="border rounded-lg mb-4">
        <div
          className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
          onClick={() => setExpandedSchema(expandedSchema === schema.id ? null : schema.id)}
        >
          <div className="flex items-center gap-3">
            {expandedSchema === schema.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span className="font-semibold capitalize">{schema.type} Schema</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeSchema(schema.id);
            }}
            className="p-1 hover:bg-red-100 rounded"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>

        {expandedSchema === schema.id && (
          <div className="p-4">
            <textarea
              defaultValue={JSON.stringify(schema.data, null, 2)}
              onChange={(e) => {
                // Store raw text temporarily
                schema._rawText = e.target.value;
              }}
              onBlur={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  updateSchema(schema.id, parsed);
                  console.log('Schema updated:', schema.id);
                } catch (err) {
                  console.error('Invalid JSON:', err);
                  alert('Invalid JSON format. Please check your syntax.');
                }
              }}
              rows={15}
              className="w-full px-3 py-2 border rounded font-mono text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50"
              placeholder="Edit JSON schema..."
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-500">
                Edit the JSON directly. Click outside the box to validate.
              </p>
              <button
                onClick={() => {
                  const formatted = JSON.stringify(schema.data, null, 2);
                  navigator.clipboard.writeText(formatted);
                  alert('Schema copied to clipboard!');
                }}
                className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                📋 Copy JSON
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Schema Markup</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold shadow-lg"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save All Schemas'}
        </button>
      </div>

      {/* Schema Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Add Schema Type:</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(schemaTemplates).map(type => (
            <button
              key={type}
              onClick={() => addSchema(type)}
              className="flex items-center gap-2 px-3 py-2 border rounded hover:bg-blue-50 hover:border-blue-500 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Existing Schemas */}
      {schemas.length > 0 ? (
        <div>
          <h4 className="text-sm font-semibold mb-3">Active Schemas ({schemas.length})</h4>
          {schemas.map(renderSchemaEditor)}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No schemas added yet.</p>
          <p className="text-sm mt-2">Click a button above to add schema markup</p>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-sm mb-2">💡 About Schema Markup</h4>
        <p className="text-xs text-gray-700">
          Schema.org markup helps search engines understand your content better, leading to rich results like star ratings, FAQs, and business info in search results.
        </p>
      </div>
    </div>
  );
};

export default SchemaPanel;

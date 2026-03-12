import React, { useState, useEffect } from 'react';
import { Code, CheckCircle, AlertCircle, Eye, ExternalLink, Edit2 } from 'lucide-react';
import api from '../utils/api';

const SchemaManager = ({ schemas = {}, onChange, postId = null }) => {
  const [localSchemas, setLocalSchemas] = useState({
    auto_generate: true,
    article_type: 'BlogPosting',
    include_author: true,
    include_breadcrumb: true,
    include_faq: false,
    custom_schema: '',
    generated_preview: '',  // Store preview
    ...schemas
  });

  const [isValidJSON, setIsValidJSON] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [generatedSchemas, setGeneratedSchemas] = useState([]);
  const [selectedSchemaIndex, setSelectedSchemaIndex] = useState(0);

  useEffect(() => {
    onChange(localSchemas);
  }, [localSchemas]);

  const handleChange = (field, value) => {
    setLocalSchemas(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomSchemaChange = (value) => {
    setLocalSchemas(prev => ({
      ...prev,
      custom_schema: value
    }));

    // Validate JSON
    if (value.trim()) {
      try {
        JSON.parse(value);
        setIsValidJSON(true);
      } catch (e) {
        setIsValidJSON(false);
      }
    } else {
      setIsValidJSON(true);
    }
  };

  const handleGeneratePreview = async () => {
    if (!postId) {
      alert('Save the post first to preview schemas');
      return;
    }

    setIsLoadingPreview(true);
    try {
      const response = await api.get(`/blog/posts/${postId}/schema?include_faq=${localSchemas.include_faq}`);
      const schemasString = response.data.schema;
      const schemasArray = JSON.parse(schemasString);
      setGeneratedSchemas(schemasArray);
      setSelectedSchemaIndex(0);
      setShowPreview(true);
    } catch (err) {
      console.error('Error generating schema preview:', err);
      alert('Failed to generate schema preview');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleTestOnGoogle = () => {
    if (generatedSchemas.length === 0) {
      alert('Generate preview first to test schemas');
      return;
    }
    
    // Get selected schema
    const selectedSchema = generatedSchemas[selectedSchemaIndex];
    const schemaString = JSON.stringify(selectedSchema);
    
    // Encode schema for URL
    const encodedSchema = encodeURIComponent(schemaString);
    
    // Open Google Rich Results Test with actual schema
    const url = `https://search.google.com/test/rich-results?code=${encodedSchema}`;
    window.open(url, '_blank');
  };

  const handleEditGeneratedSchema = () => {
    if (generatedSchemas.length > 0 && generatedSchemas[selectedSchemaIndex]) {
      const schemaToEdit = JSON.stringify(generatedSchemas[selectedSchemaIndex], null, 2);
      setLocalSchemas(prev => ({
        ...prev,
        custom_schema: schemaToEdit
      }));
      setIsEditing(true);
      alert('Selected schema loaded into custom editor. You can now edit it.');
    }
  };

  const getSchemaTypeName = (schema) => {
    if (!schema || !schema['@type']) return 'Unknown';
    const type = schema['@type'];
    
    // Map schema types to friendly names
    const typeMap = {
      'BlogPosting': '📝 Blog Posting',
      'NewsArticle': '📰 News Article',
      'Article': '📄 Article',
      'BreadcrumbList': '🍞 Breadcrumb',
      'FAQPage': '❓ FAQ Page',
      'Person': '👤 Author (Person)',
      'Organization': '🏢 Organization'
    };
    
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Code className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Schema.org Structured Data</h4>
            <p className="text-sm text-blue-800">
              Schemas help Google understand your content better, improving search visibility and enabling rich results 
              (star ratings, FAQs, breadcrumbs). Schemas are auto-generated from your post data.
            </p>
          </div>
        </div>
      </div>

      {/* Auto-Generate Toggle */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Auto-Generate Schemas</h4>
            <p className="text-sm text-gray-600">
              Automatically create Article, Author, and Breadcrumb schemas from post data
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localSchemas.auto_generate}
              onChange={(e) => handleChange('auto_generate', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {localSchemas.auto_generate && (
        <div className="space-y-4">
          {/* Article Type */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Article Type
            </label>
            <select
              value={localSchemas.article_type}
              onChange={(e) => handleChange('article_type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="BlogPosting">BlogPosting (Standard blog posts)</option>
              <option value="Article">Article (General articles)</option>
              <option value="NewsArticle">NewsArticle (News & current events)</option>
            </select>
            <p className="mt-2 text-xs text-gray-500">
              Select the type that best describes your content. NewsArticle is for time-sensitive news.
            </p>
          </div>

          {/* Include Options */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
            <h4 className="font-semibold text-gray-900 mb-3">Include in Schema</h4>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={localSchemas.include_author}
                onChange={(e) => handleChange('include_author', e.target.checked)}
                id="include_author"
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="include_author" className="text-sm text-gray-700">
                <span className="font-medium">Author Schema</span> - Person schema with credentials
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={localSchemas.include_breadcrumb}
                onChange={(e) => handleChange('include_breadcrumb', e.target.checked)}
                id="include_breadcrumb"
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="include_breadcrumb" className="text-sm text-gray-700">
                <span className="font-medium">Breadcrumb Schema</span> - Navigation path (Home → Blog → Article)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={localSchemas.include_faq}
                onChange={(e) => handleChange('include_faq', e.target.checked)}
                id="include_faq"
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="include_faq" className="text-sm text-gray-700">
                <span className="font-medium">FAQ Schema</span> - If article contains FAQs (enables rich results)
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Custom Schema */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900">Custom Schema (Optional)</h4>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                alert('Schema changes saved to custom schema field. Click "Save Settings" at the bottom to persist changes.');
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
            >
              ✓ Save Schema Changes
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Add additional custom JSON-LD schema. This will be included alongside auto-generated schemas.
        </p>
        <textarea
          value={localSchemas.custom_schema}
          onChange={(e) => handleCustomSchemaChange(e.target.value)}
          rows={8}
          className={`w-full px-4 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 ${
            !isValidJSON ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={`{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Your Product",
  "description": "Product description"
}`}
        />
        <div className="mt-2 flex items-center gap-2">
          {localSchemas.custom_schema.trim() && (
            isValidJSON ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-medium">Valid JSON-LD</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-xs text-red-600 font-medium">Invalid JSON - please check syntax</span>
              </>
            )
          )}
        </div>
      </div>

      {/* Preview & Test Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleGeneratePreview}
          disabled={isLoadingPreview}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium disabled:opacity-50"
        >
          <Eye className="w-5 h-5" />
          {isLoadingPreview ? 'Generating...' : 'Preview Generated Schemas'}
        </button>
        
        <button
          type="button"
          onClick={handleTestOnGoogle}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
        >
          <ExternalLink className="w-5 h-5" />
          Test on Google
        </button>
      </div>

      {/* Schema Preview with Selector */}
      {showPreview && generatedSchemas.length > 0 && (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 border-b">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Generated Schemas ({generatedSchemas.length})
              </h4>
              <button
                type="button"
                onClick={handleEditGeneratedSchema}
                className="flex items-center gap-2 text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                <Edit2 className="w-4 h-4" />
                Edit This Schema
              </button>
            </div>
            
            {/* Schema Selector */}
            <div className="flex gap-2 flex-wrap">
              {generatedSchemas.map((schema, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedSchemaIndex(index)}
                  className={`px-3 py-2 rounded text-sm font-medium transition ${
                    selectedSchemaIndex === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {getSchemaTypeName(schema)}
                </button>
              ))}
            </div>
          </div>
          
          <pre className="p-4 bg-gray-50 text-xs overflow-x-auto max-h-96 overflow-y-auto">
            <code>{JSON.stringify(generatedSchemas[selectedSchemaIndex], null, 2)}</code>
          </pre>
        </div>
      )}

      {/* Schema Preview Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-green-900 mb-1">Testing Your Schemas</h4>
            <p className="text-sm text-green-800 mb-2">
              After publishing, test your schemas using:
            </p>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900">Google Rich Results Test</a></li>
              <li>• <a href="https://validator.schema.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900">Schema.org Validator</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemaManager;

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Eye, Undo, Redo, Monitor, Smartphone, Tablet } from 'lucide-react';
import api from '../../../utils/api';
import SimpleComponentLibrary from './SimpleComponentLibrary';
import SimplePropertiesPanel from './SimplePropertiesPanel';
import SEOPanel from './SEOPanel';
import SchemaPanel from './SchemaPanel';

/**
 * Visual Editor - True WYSIWYG page builder
 * Loads the actual page in an iframe and allows visual editing
 */
const VisualEditor = () => {
  const { pageId } = useParams();
  const iframeRef = useRef(null);
  const [pageData, setPageData] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [viewportMode, setViewportMode] = useState('desktop'); // desktop, tablet, mobile
  const [activeTab, setActiveTab] = useState('visual'); // visual, seo, schema
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState({}); // Track all changes by element ID
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (pageId) {
      loadPageData();
    }
  }, [pageId]);

  useEffect(() => {
    if (iframeRef.current && pageData) {
      setupIframeEditing();
    }
  }, [pageData]);

  const loadPageData = async () => {
    try {
      const response = await api.get(`/pages/${pageId}`);
      setPageData(response.data);
    } catch (err) {
      console.error('Error loading page:', err);
    }
  };

  const setupIframeEditing = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Wait for iframe to load
    iframe.onload = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Inject editing CSS
        const style = iframeDoc.createElement('style');
        style.textContent = `
          .editable-element {
            position: relative;
            cursor: pointer !important;
            transition: outline 0.2s;
          }
          .editable-element:hover {
            outline: 2px dashed #3B82F6 !important;
            outline-offset: 2px !important;
            z-index: 1 !important;
          }
          .editable-element.selected {
            outline: 3px solid #3B82F6 !important;
            outline-offset: 2px !important;
            background-color: rgba(59, 130, 246, 0.05) !important;
            z-index: 2 !important;
          }
          
          /* Make text elements clickable over sections */
          h1.editable-element, h2.editable-element, h3.editable-element,
          h4.editable-element, h5.editable-element, h6.editable-element,
          p.editable-element, span.editable-element {
            z-index: 10 !important;
          }
          
          .element-label {
            position: absolute;
            top: -24px;
            left: 0;
            background: #3B82F6;
            color: white;
            padding: 2px 8px;
            font-size: 11px;
            border-radius: 3px;
            z-index: 10000;
            pointer-events: none;
          }
          * {
            pointer-events: auto !important;
          }
        `;
        iframeDoc.head.appendChild(style);

        // Wait a bit for content to render, then make elements editable
        setTimeout(() => {
          makeElementsEditable(iframeDoc);
          setupDropZones(iframeDoc);
          console.log('Visual editor initialized successfully');
        }, 500);
      } catch (err) {
        console.error('Cannot access iframe:', err);
        alert('Unable to access page content. The page might be loading from a different domain or there may be security restrictions.');
      }
    };
  };

  const makeElementsEditable = (doc) => {
    // Target common elements - be more specific
    const selectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',  // Headings
      'p',                                  // Paragraphs
      'span',                               // Spans (often contain numbers/text)
      'div[class*="text"]',                 // Text divs
      'button',                             // Buttons
      'a[href]',                           // Links
      'img',                               // Images
      'section'                            // Sections
    ];

    let elementCount = 0;
    selectors.forEach(selector => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(el => {
        // Skip if already marked
        if (el.classList.contains('editable-element')) return;
        
        // Skip empty elements or elements with no visible content
        if (!el.textContent.trim() && !el.src) return;
        
        // Don't make nav items editable initially
        const isNav = el.closest('nav') || el.closest('header');
        if (isNav && (el.tagName === 'A' || el.tagName === 'BUTTON')) return;
        
        el.classList.add('editable-element');
        el.dataset.elementType = getElementType(el);
        el.dataset.elementId = `element-${elementCount++}`;
        
        // Add click handler - use bubble phase so child elements are prioritized
        el.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // If clicking a section/container, try to find a text element inside
          if (el.tagName === 'SECTION' || el.tagName === 'DIV') {
            const textChild = el.querySelector('h1, h2, h3, h4, h5, h6, p, span');
            if (textChild && textChild.classList.contains('editable-element')) {
              handleElementSelect(textChild, doc);
              return;
            }
          }
          
          handleElementSelect(el, doc);
        }, false); // Use bubble phase
        
        // Add hover label
        el.addEventListener('mouseenter', (e) => {
          const existing = doc.getElementById('hover-label');
          if (existing) existing.remove();
          
          const label = doc.createElement('div');
          label.className = 'element-label';
          const type = getElementType(el).toUpperCase();
          label.textContent = type === 'TEXT' ? 'CLICK TO EDIT TEXT' : `EDIT ${type}`;
          label.id = 'hover-label';
          el.style.position = 'relative';
          el.appendChild(label);
        });
        
        el.addEventListener('mouseleave', (e) => {
          const label = doc.getElementById('hover-label');
          if (label) label.remove();
        });
      });
    });
    
    console.log(`Made ${elementCount} elements editable`);
  };

  const getElementType = (element) => {
    const tagName = element.tagName.toLowerCase();
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) return 'heading';
    if (tagName === 'button' || element.classList.contains('button')) return 'button';
    if (tagName === 'img') return 'image';
    if (tagName === 'p' || tagName === 'span' || tagName === 'div') return 'text';
    if (tagName === 'a') return 'text'; // Links can also be edited as text
    if (tagName === 'section') return 'section';
    return 'text'; // Default to text so everything is editable
  };

  const handleElementSelect = (element, doc) => {
    console.log('========= ELEMENT SELECTED =========');
    console.log('Tag:', element.tagName);
    console.log('Text:', element.textContent?.substring(0, 100));
    console.log('Type:', element.dataset.elementType);
    
    // Remove previous selection
    const prevSelected = doc.querySelector('.selected');
    if (prevSelected) {
      prevSelected.classList.remove('selected');
    }

    // Mark as selected
    element.classList.add('selected');
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Extract element properties
    const elementData = {
      id: element.dataset.elementId,
      type: element.dataset.elementType,
      element: element,
      props: extractElementProps(element)
    };

    console.log('Element Data:', {
      type: elementData.type,
      content: elementData.props.content?.substring(0, 50),
      hasContent: !!elementData.props.content
    });
    console.log('====================================');
    
    setSelectedElement(elementData);
  };

  const extractElementProps = (element) => {
    const props = {
      content: element.textContent || element.innerHTML,
      style: {
        color: window.getComputedStyle(element).color,
        backgroundColor: window.getComputedStyle(element).backgroundColor,
        fontSize: window.getComputedStyle(element).fontSize,
        fontWeight: window.getComputedStyle(element).fontWeight,
        textAlign: window.getComputedStyle(element).textAlign,
      }
    };

    if (element.tagName === 'IMG') {
      props.src = element.src;
      props.alt = element.alt;
    }

    if (element.tagName === 'A' || element.tagName === 'BUTTON') {
      props.link = element.href;
      props.text = element.textContent;
    }

    return props;
  };

  const handlePropertyUpdate = (property, value) => {
    if (!selectedElement || !selectedElement.element) {
      console.log('No element selected for update');
      return;
    }

    const element = selectedElement.element;
    const elementId = selectedElement.id;
    console.log('Updating property:', property, 'to:', value);

    // Update the element based on property
    if (property === 'content') {
      element.textContent = value;
    } else if (property === 'text') {
      element.textContent = value;
    } else if (property.startsWith('style.')) {
      const styleProp = property.replace('style.', '');
      element.style[styleProp] = value;
    } else if (property === 'src') {
      element.src = value;
    } else if (property === 'alt') {
      element.alt = value;
    } else if (property === 'link') {
      element.href = value;
    }

    // Track this change
    trackChange(elementId, property, value, element);

    // Update selected element data
    setSelectedElement({
      ...selectedElement,
      props: extractElementProps(element)
    });
    
    console.log('Element updated successfully');
  };

  // Track changes for saving
  const trackChange = (elementId, property, value, element) => {
    // Get element selector for finding it later
    const selector = getElementSelector(element);
    
    setChanges(prev => ({
      ...prev,
      [elementId]: {
        ...prev[elementId],
        selector,
        tagName: element.tagName.toLowerCase(),
        changes: {
          ...(prev[elementId]?.changes || {}),
          [property]: value
        }
      }
    }));

    console.log('Change tracked:', elementId, property, value);
  };

  // Generate a unique selector for an element
  const getElementSelector = (element) => {
    if (element.id) return `#${element.id}`;
    
    // Build a path using classes and nth-child
    const path = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.className && typeof current.className === 'string') {
        const classes = current.className.split(' ').filter(c => c && !c.includes('editable')).slice(0, 2);
        if (classes.length) selector += '.' + classes.join('.');
      }
      
      // Add nth-child if needed for specificity
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === current.tagName);
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          selector += `:nth-of-type(${index})`;
        }
      }
      
      path.unshift(selector);
      current = current.parentElement;
      
      // Stop at main content area to keep selectors manageable
      if (current?.tagName === 'MAIN' || current?.id === 'root') break;
    }
    
    return path.join(' > ');
  };

  // Handle drag start from component library
  const handleDragStart = (e, componentType) => {
    e.dataTransfer.setData('componentType', componentType);
    e.dataTransfer.effectAllowed = 'copy';
    console.log('Drag started:', componentType);
  };

  // Setup drop zones in iframe
  const setupDropZones = (doc) => {
    // Allow dropping on the body
    const body = doc.body;
    
    body.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    
    body.addEventListener('drop', (e) => {
      e.preventDefault();
      const componentType = e.dataTransfer.getData('componentType');
      
      if (componentType) {
        // Create new element based on type
        const newElement = createNewComponent(componentType, doc);
        
        // Find closest container to drop point
        const dropTarget = doc.elementFromPoint(e.clientX, e.clientY);
        const container = dropTarget?.closest('section, div, main') || doc.body;
        
        // Insert the new element
        container.appendChild(newElement);
        
        // Make the new element immediately editable
        newElement.classList.add('editable-element');
        newElement.dataset.elementType = getElementType(newElement);
        newElement.dataset.elementId = `element-${Date.now()}`;
        
        // Add click handler to the new element
        newElement.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleElementSelect(newElement, doc);
        }, false);
        
        // Add hover label
        newElement.addEventListener('mouseenter', (e) => {
          const existing = doc.getElementById('hover-label');
          if (existing) existing.remove();
          
          const label = doc.createElement('div');
          label.className = 'element-label';
          const type = getElementType(newElement).toUpperCase();
          label.textContent = type === 'TEXT' ? 'CLICK TO EDIT TEXT' : `EDIT ${type}`;
          label.id = 'hover-label';
          newElement.style.position = 'relative';
          newElement.appendChild(label);
        });
        
        newElement.addEventListener('mouseleave', (e) => {
          const label = doc.getElementById('hover-label');
          if (label) label.remove();
        });
        
        // Auto-select the new element immediately
        setTimeout(() => {
          handleElementSelect(newElement, doc);
        }, 100);
        
        console.log('Component dropped and made editable:', componentType);
      }
    });
  };

  // Create new component element
  const createNewComponent = (type, doc) => {
    let element;
    
    switch (type) {
      case 'heading':
        element = doc.createElement('h2');
        element.textContent = 'New Heading - Click to Edit';
        element.className = 'text-3xl font-bold my-4';
        break;
        
      case 'text':
        element = doc.createElement('p');
        element.textContent = 'New text paragraph. Click to edit this content.';
        element.className = 'my-4';
        break;
        
      case 'button':
        element = doc.createElement('button');
        element.textContent = 'New Button';
        element.className = 'px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700';
        break;
        
      case 'image':
        element = doc.createElement('img');
        element.src = 'https://via.placeholder.com/400x300';
        element.alt = 'New image';
        element.className = 'max-w-full h-auto my-4';
        break;
      
      case 'html_box':
        element = doc.createElement('div');
        element.className = 'html-box p-4 border-2 border-dashed border-blue-300 bg-blue-50 my-4';
        element.innerHTML = '<p>Click to edit HTML. You can add forms, embed codes, or any custom HTML here.</p>';
        element.dataset.isHtmlBox = 'true';
        break;
      
      case 'video':
        element = doc.createElement('div');
        element.className = 'video-container my-4';
        element.innerHTML = `
          <div class="aspect-w-16 aspect-h-9 bg-gray-900 flex items-center justify-center rounded">
            <p class="text-white text-sm">Video Player - Click to select video from CMS</p>
          </div>
        `;
        element.dataset.isVideo = 'true';
        break;
        
      default:
        element = doc.createElement('div');
        element.textContent = `New ${type} component`;
        element.className = 'p-4 border-2 border-dashed border-gray-300 my-4';
    }
    
    return element;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      console.log('Saving changes:', changes);
      
      // Convert changes object to array for backend
      const changesArray = Object.values(changes);
      
      if (changesArray.length === 0) {
        alert('No changes to save');
        setSaving(false);
        return;
      }

      // Save to backend
      const response = await api.post('/page-builder/save-changes', {
        page_id: pageId,
        changes: changesArray
      });

      console.log('Save response:', response.data);
      alert(`✅ Page saved successfully! ${changesArray.length} changes saved.`);
      
      // Clear changes after successful save
      setChanges({});
    } catch (err) {
      console.error('Error saving:', err);
      alert('❌ Error saving page: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      // TODO: Apply previous state
      console.log('Undo clicked');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      // TODO: Apply next state
      console.log('Redo clicked');
    }
  };

  const getIframeWidth = () => {
    switch (viewportMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  if (!pageData) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Toolbar */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">Editing: {pageData.title}</h1>
          
          <div className="flex items-center gap-2">
            {Object.keys(changes).length > 0 && (
              <span className="text-sm text-white bg-orange-500 px-3 py-2 rounded font-semibold">
                {Object.keys(changes).length} unsaved change{Object.keys(changes).length !== 1 ? 's' : ''}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold shadow-lg"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Page'}
            </button>
            <button
              onClick={() => window.open(`/${pageData.slug}`, '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b -mb-3">
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'visual'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Visual Editor
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'seo'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            SEO Settings
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'schema'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Schema Markup
          </button>
        </div>
      </div>

      {/* Visual Editor Toolbar */}
      {activeTab === 'visual' && (
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b">
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 mr-2">Viewport:</span>
            <button
              onClick={() => setViewportMode('desktop')}
              className={`p-2 rounded ${viewportMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewportMode('tablet')}
              className={`p-2 rounded ${viewportMode === 'tablet' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              className={`p-2 rounded ${viewportMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'visual' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Component Library */}
          <div className="w-64 bg-white border-r overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Add Components</h3>
              <p className="text-xs text-gray-500 mb-4">Drag components onto the page</p>
              <SimpleComponentLibrary onDragStart={handleDragStart} />
            </div>
          </div>

          {/* Center - Page Preview in Iframe */}
          <div className="flex-1 overflow-auto bg-gray-200 p-8">
            <div 
              className="mx-auto bg-white shadow-lg transition-all duration-300"
              style={{ width: getIframeWidth(), minHeight: '100%' }}
            >
              <iframe
                ref={iframeRef}
                src={`/${pageData.slug}`}
                className="w-full h-full border-0"
                style={{ minHeight: '800px' }}
                title="Page Preview"
              />
            </div>
          </div>

          {/* Right Sidebar - Properties Panel */}
          {selectedElement && (
            <SimplePropertiesPanel
              selectedElement={selectedElement}
              onUpdate={handlePropertyUpdate}
              onClose={() => setSelectedElement(null)}
            />
          )}
        </div>
      )}

      {/* SEO Tab Content */}
      {activeTab === 'seo' && (
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            <SEOPanel pageId={pageId} pageData={pageData} />
          </div>
        </div>
      )}

      {/* Schema Tab Content */}
      {activeTab === 'schema' && (
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            <SchemaPanel pageId={pageId} pageData={pageData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualEditor;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import api from '../../../utils/api';
import ComponentLibrary from './ComponentLibrary';
import Canvas from './Canvas';
import PropertiesPanel from './PropertiesPanel';
import { Save, Eye, Undo, Redo } from 'lucide-react';

const PageBuilder = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [pageName, setPageName] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (pageId) {
      loadPageLayout();
      loadPageInfo();
    }
  }, [pageId]);

  const loadPageLayout = async () => {
    try {
      const response = await api.get(`/page-builder/layout/${pageId}`);
      const layoutData = response.data.layout_data || { components: [], settings: {} };
      setComponents(layoutData.components || []);
      setHistory([layoutData.components || []]);
      setHistoryIndex(0);
    } catch (err) {
      console.error('Error loading page layout:', err);
    }
  };

  const loadPageInfo = async () => {
    try {
      const response = await api.get(`/pages/${pageId}`);
      setPageName(response.data.title);
      setPageSlug(response.data.slug);
    } catch (err) {
      console.error('Error loading page info:', err);
    }
  };

  const addToHistory = (newComponents) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newComponents);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    // If dragging from component library
    if (active.id.startsWith('new-')) {
      const componentType = active.id.replace('new-', '');
      const newComponent = createComponent(componentType);
      const newComponents = [...components, newComponent];
      setComponents(newComponents);
      addToHistory(newComponents);
    }
    // If reordering existing components
    else if (active.id !== over.id) {
      const oldIndex = components.findIndex(c => c.id === active.id);
      const newIndex = components.findIndex(c => c.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newComponents = [...components];
        const [removed] = newComponents.splice(oldIndex, 1);
        newComponents.splice(newIndex, 0, removed);
        setComponents(newComponents);
        addToHistory(newComponents);
      }
    }

    setActiveId(null);
  };

  const createComponent = (type) => {
    const id = `${type}-${Date.now()}`;
    const baseComponent = {
      id,
      type,
      order: components.length
    };

    // Default props based on component type
    switch (type) {
      case 'text':
        return { ...baseComponent, props: { content: 'New text block', style: {} } };
      case 'heading':
        return { ...baseComponent, props: { content: 'New Heading', level: 'h2', style: {} } };
      case 'image':
        return { ...baseComponent, props: { src: '', alt: '', style: {} } };
      case 'button':
        return { ...baseComponent, props: { text: 'Click Me', link: '', style: {} } };
      case 'blog_list':
        return { ...baseComponent, props: { limit: 3, category: 'all', style: {} } };
      case 'review_list':
        return { ...baseComponent, props: { limit: 3, featured: false, style: {} } };
      case 'video':
        return { ...baseComponent, props: { src: '', style: {} } };
      case 'section':
        return { ...baseComponent, props: { children: [], style: {} } };
      default:
        return baseComponent;
    }
  };

  const updateComponent = (id, updates) => {
    const newComponents = components.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    setComponents(newComponents);
    addToHistory(newComponents);
  };

  const deleteComponent = (id) => {
    const newComponents = components.filter(c => c.id !== id);
    setComponents(newComponents);
    addToHistory(newComponents);
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.post('/page-builder/layout', {
        page_id: pageId,
        layout_data: { components, settings: {} }
      });
      alert('Page saved successfully!');
    } catch (err) {
      console.error('Error saving page:', err);
      alert('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setComponents(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setComponents(history[historyIndex + 1]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/pages')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Pages
          </button>
          <div className="border-l border-gray-300 pl-4">
            <h1 className="text-lg font-semibold">Editing: {pageName || 'Untitled Page'}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
            title="Undo"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
            title="Redo"
          >
            <Redo className="w-5 h-5" />
          </button>
          <div className="border-l border-gray-300 h-6"></div>
          <button
            onClick={() => window.open(`/${pageSlug}`, '_blank')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            disabled={!pageSlug}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          {/* Component Library - Left Sidebar */}
          <ComponentLibrary />

          {/* Canvas - Center */}
          <div className="flex-1 overflow-auto bg-gray-100 p-6">
            <SortableContext
              items={components.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <Canvas
                components={components}
                selectedComponent={selectedComponent}
                onSelectComponent={setSelectedComponent}
                onDeleteComponent={deleteComponent}
              />
            </SortableContext>
          </div>

          {/* Properties Panel - Right Sidebar */}
          {selectedComponent && (
            <PropertiesPanel
              component={selectedComponent}
              onUpdate={(updates) => updateComponent(selectedComponent.id, updates)}
              onClose={() => setSelectedComponent(null)}
            />
          )}

          <DragOverlay>
            {activeId ? (
              <div className="bg-white p-4 rounded shadow-lg border-2 border-blue-500">
                Dragging: {activeId}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default PageBuilder;

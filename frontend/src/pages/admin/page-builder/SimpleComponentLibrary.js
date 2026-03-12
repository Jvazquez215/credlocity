import React from 'react';
import { Type, Image, Video, MousePointer, FileText, Star, Layout, Heading, Code, Play } from 'lucide-react';

const DraggableComponent = ({ id, icon: Icon, label, onDragStart }) => {
  return (
    <div
      draggable="true"
      onDragStart={(e) => onDragStart(e, id)}
      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:border-blue-500 hover:shadow-md transition"
    >
      <Icon className="w-5 h-5 text-gray-600" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

const SimpleComponentLibrary = ({ onDragStart }) => {
  const components = [
    { id: 'heading', icon: Heading, label: 'Heading' },
    { id: 'text', icon: Type, label: 'Text Block' },
    { id: 'image', icon: Image, label: 'Image' },
    { id: 'button', icon: MousePointer, label: 'Button' },
    { id: 'html_box', icon: Code, label: 'HTML Box' },
    { id: 'video', icon: Play, label: 'Video Player' },
    { id: 'blog_list', icon: FileText, label: 'Blog Posts' },
    { id: 'review_list', icon: Star, label: 'Reviews' },
    { id: 'section', icon: Layout, label: 'Section Container' },
  ];

  return (
    <div className="space-y-2">
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Content</h3>
        {components.slice(0, 5).map((component) => (
          <div key={component.id} className="mb-2">
            <DraggableComponent
              id={component.id}
              icon={component.icon}
              label={component.label}
              onDragStart={onDragStart}
            />
          </div>
        ))}
      </div>

      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Dynamic Content</h3>
        {components.slice(5, 8).map((component) => (
          <div key={component.id} className="mb-2">
            <DraggableComponent
              id={component.id}
              icon={component.icon}
              label={component.label}
              onDragStart={onDragStart}
            />
          </div>
        ))}
      </div>

      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Layout</h3>
        {components.slice(8).map((component) => (
          <div key={component.id} className="mb-2">
            <DraggableComponent
              id={component.id}
              icon={component.icon}
              label={component.label}
              onDragStart={onDragStart}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleComponentLibrary;

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Type, Image, Video, MousePointer, FileText, Star, Layout, Heading } from 'lucide-react';

const DraggableComponent = ({ id, icon: Icon, label }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `new-${id}`,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:border-blue-500 hover:shadow-md transition"
    >
      <Icon className="w-5 h-5 text-gray-600" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

const ComponentLibrary = () => {
  const components = [
    { id: 'heading', icon: Heading, label: 'Heading' },
    { id: 'text', icon: Type, label: 'Text Block' },
    { id: 'image', icon: Image, label: 'Image' },
    { id: 'video', icon: Video, label: 'Video' },
    { id: 'button', icon: MousePointer, label: 'Button' },
    { id: 'blog_list', icon: FileText, label: 'Blog Posts' },
    { id: 'review_list', icon: Star, label: 'Reviews' },
    { id: 'section', icon: Layout, label: 'Section Container' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Components</h2>
        <p className="text-xs text-gray-500 mt-1">Drag to add to page</p>
      </div>

      <div className="p-4 space-y-2">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Basic</h3>
          <div className="space-y-2">
            <DraggableComponent id="heading" icon={Heading} label="Heading" />
            <DraggableComponent id="text" icon={Type} label="Text Block" />
            <DraggableComponent id="image" icon={Image} label="Image" />
            <DraggableComponent id="video" icon={Video} label="Video" />
            <DraggableComponent id="button" icon={MousePointer} label="Button" />
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Dynamic Content</h3>
          <div className="space-y-2">
            <DraggableComponent id="blog_list" icon={FileText} label="Blog Posts" />
            <DraggableComponent id="review_list" icon={Star} label="Reviews" />
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Layout</h3>
          <div className="space-y-2">
            <DraggableComponent id="section" icon={Layout} label="Section" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentLibrary;

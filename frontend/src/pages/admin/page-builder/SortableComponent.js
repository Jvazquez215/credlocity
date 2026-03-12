import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import ComponentRenderer from './ComponentRenderer';

const SortableComponent = ({ component, isSelected, onSelect, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'} rounded`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Drag Handle & Controls */}
      <div className="absolute -left-10 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          {...attributes}
          {...listeners}
          className="p-1 bg-gray-200 rounded hover:bg-gray-300 cursor-move"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Component Content */}
      <div className={`${isSelected ? 'bg-blue-50' : ''} p-4 rounded`}>
        <ComponentRenderer component={component} />
      </div>
    </div>
  );
};

export default SortableComponent;

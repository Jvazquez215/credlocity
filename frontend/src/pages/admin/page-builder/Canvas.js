import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import SortableComponent from './SortableComponent';

const Canvas = ({ components, selectedComponent, onSelectComponent, onDeleteComponent }) => {
  const { setNodeRef } = useDroppable({
    id: 'canvas',
  });

  return (
    <div
      ref={setNodeRef}
      className="bg-white rounded-lg shadow-sm min-h-screen p-8"
      style={{ maxWidth: '1200px', margin: '0 auto' }}
    >
      {components.length === 0 ? (
        <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-2">Drop components here to start building</p>
            <p className="text-sm text-gray-400">Drag items from the left sidebar</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {components.map((component) => (
            <SortableComponent
              key={component.id}
              component={component}
              isSelected={selectedComponent?.id === component.id}
              onSelect={() => onSelectComponent(component)}
              onDelete={() => onDeleteComponent(component.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Canvas;

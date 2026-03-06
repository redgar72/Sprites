import React from 'react';
import { Tool } from '../App';
import './Toolbar.css';

interface ToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ currentTool, onToolChange }) => {
  const tools: Array<{ id: Tool; name: string; icon: string }> = [
    { id: 'pencil', name: 'Pencil', icon: '✏️' },
    { id: 'eraser', name: 'Eraser', icon: '🧹' },
    { id: 'fill', name: 'Fill', icon: '🪣' },
    { id: 'eyedropper', name: 'Eyedropper', icon: '👁️' }
  ];

  return (
    <div className="toolbar">
      <h3>Tools</h3>
      <div className="toolbar-buttons">
        {tools.map(tool => (
          <button
            key={tool.id}
            className={`tool-btn ${currentTool === tool.id ? 'active' : ''}`}
            onClick={() => onToolChange(tool.id)}
            title={tool.name}
          >
            {tool.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Toolbar;

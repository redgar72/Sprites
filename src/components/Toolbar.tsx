import { Tool, MirrorMode } from '../App';
import './Toolbar.css';

interface ToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
  mirrorMode: MirrorMode;
  onMirrorModeChange: (mode: MirrorMode) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ currentTool, onToolChange, mirrorMode, onMirrorModeChange }) => {
  const tools: Array<{ id: Tool; name: string; icon: string }> = [
    { id: 'pencil', name: 'Pencil', icon: '✏️' },
    { id: 'eraser', name: 'Eraser', icon: '🧹' },
    { id: 'fill', name: 'Fill', icon: '🪣' },
    { id: 'eyedropper', name: 'Eyedropper', icon: '👁️' }
  ];

  const mirrorModes: Array<{ id: MirrorMode; name: string; icon: string }> = [
    { id: 'none', name: 'No Mirror', icon: '🚫' },
    { id: 'horizontal', name: 'Mirror Horizontal', icon: '↔️' },
    { id: 'vertical', name: 'Mirror Vertical', icon: '↕️' },
    { id: 'both', name: 'Mirror Both', icon: '🔄' }
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
      <h3 style={{ marginTop: '16px' }}>Mirror</h3>
      <div className="toolbar-buttons">
        {mirrorModes.map(mode => (
          <button
            key={mode.id}
            className={`tool-btn ${mirrorMode === mode.id ? 'active' : ''}`}
            onClick={() => onMirrorModeChange(mode.id)}
            title={mode.name}
          >
            {mode.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Toolbar;

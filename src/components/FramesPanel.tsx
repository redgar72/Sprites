import { Frame } from '../App';
import './FramesPanel.css';

interface FramesPanelProps {
  frames: Frame[];
  currentFrameIndex: number;
  onFrameSelect: (index: number) => void;
  onAddFrame: () => void;
}

const FramesPanel: React.FC<FramesPanelProps> = ({
  frames,
  currentFrameIndex,
  onFrameSelect,
  onAddFrame
}) => {
  return (
    <div className="frames-panel">
      <div className="panel-header">
        <h3>Frames</h3>
        <button onClick={onAddFrame} className="add-btn">+</button>
      </div>
      <div className="frames-list">
        {frames.map((frame, index) => (
          <div
            key={frame.id}
            className={`frame-item ${currentFrameIndex === index ? 'active' : ''}`}
            onClick={() => onFrameSelect(index)}
          >
            <span className="frame-number">{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FramesPanel;

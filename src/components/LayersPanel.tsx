import { Layer } from '../App';
import './LayersPanel.css';

interface LayersPanelProps {
  layers: Layer[];
  currentLayerIndex: number;
  onLayerSelect: (index: number) => void;
  onLayerVisibilityToggle: (layerId: string) => void;
  onAddLayer: () => void;
  onMirrorLayer: (layerId: string, axis: 'horizontal' | 'vertical') => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  currentLayerIndex,
  onLayerSelect,
  onLayerVisibilityToggle,
  onAddLayer,
  onMirrorLayer
}) => {
  return (
    <div className="layers-panel">
      <div className="panel-header">
        <h3>Layers</h3>
        <button onClick={onAddLayer} className="add-btn">+</button>
      </div>
      <div className="layers-list">
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            className={`layer-item ${currentLayerIndex === index ? 'active' : ''}`}
            onClick={() => onLayerSelect(index)}
          >
            <button
              className="visibility-btn"
              onClick={(e) => {
                e.stopPropagation();
                onLayerVisibilityToggle(layer.id);
              }}
            >
              {layer.visible ? '👁️' : '🚫'}
            </button>
            <span className="layer-name">{layer.name}</span>
            <div className="layer-actions" onClick={(e) => e.stopPropagation()}>
              <button
                className="mirror-btn"
                onClick={() => onMirrorLayer(layer.id, 'horizontal')}
                title="Mirror Horizontal"
              >
                ↔️
              </button>
              <button
                className="mirror-btn"
                onClick={() => onMirrorLayer(layer.id, 'vertical')}
                title="Mirror Vertical"
              >
                ↕️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayersPanel;

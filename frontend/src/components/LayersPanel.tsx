import React from 'react';
import { Layer } from '../App';
import './LayersPanel.css';

interface LayersPanelProps {
  layers: Layer[];
  currentLayerIndex: number;
  onLayerSelect: (index: number) => void;
  onLayerVisibilityToggle: (layerId: string) => void;
  onAddLayer: () => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  currentLayerIndex,
  onLayerSelect,
  onLayerVisibilityToggle,
  onAddLayer
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayersPanel;

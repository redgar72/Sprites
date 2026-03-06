import React from 'react';
import './PixelSizeControl.css';

interface PixelSizeControlProps {
  pixelSize: number;
  onPixelSizeChange: (size: number) => void;
}

const PixelSizeControl: React.FC<PixelSizeControlProps> = ({ pixelSize, onPixelSizeChange }) => {
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPixelSizeChange(parseInt(e.target.value));
  };

  return (
    <div className="pixel-size-control">
      <h3>Pixel Size</h3>
      <div className="size-control">
        <label>Size: {pixelSize}px</label>
        <input
          type="range"
          min="1"
          max="32"
          value={pixelSize}
          onChange={handleSizeChange}
          className="size-slider"
        />
      </div>
    </div>
  );
};

export default PixelSizeControl;

import React from 'react';
import './ColorPicker.css';

interface ColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ currentColor, onColorChange }) => {
  const presetColors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#808080', '#800000',
    '#008000', '#000080', '#808000', '#800080', '#008080'
  ];

  return (
    <div className="color-picker">
      <h3>Colors</h3>
      <div className="color-preview" style={{ background: currentColor }} />
      <input
        type="color"
        className="color-input"
        value={currentColor}
        onChange={(e) => onColorChange(e.target.value)}
      />
      <div className="color-presets">
        {presetColors.map(color => (
          <button
            key={color}
            className="color-preset"
            style={{ background: color }}
            onClick={() => onColorChange(color)}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;

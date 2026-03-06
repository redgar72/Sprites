import './ColorPicker.css';

export type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

interface ColorPickerProps {
  currentColor: RGBA;
  onColorChange: (color: RGBA) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ currentColor, onColorChange }) => {
  const presetColors: RGBA[] = [
    { r: 0, g: 0, b: 0, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
    { r: 255, g: 0, b: 0, a: 255 },
    { r: 0, g: 255, b: 0, a: 255 },
    { r: 0, g: 0, b: 255, a: 255 },
    { r: 255, g: 255, b: 0, a: 255 },
    { r: 255, g: 0, b: 255, a: 255 },
    { r: 0, g: 255, b: 255, a: 255 },
    { r: 128, g: 128, b: 128, a: 255 },
    { r: 128, g: 0, b: 0, a: 255 },
    { r: 0, g: 128, b: 0, a: 255 },
    { r: 0, g: 0, b: 128, a: 255 },
    { r: 128, g: 128, b: 0, a: 255 },
    { r: 128, g: 0, b: 128, a: 255 },
    { r: 0, g: 128, b: 128, a: 255 }
  ];

  const rgbaToHex = (rgba: RGBA): string => {
    const r = rgba.r.toString(16).padStart(2, '0');
    const g = rgba.g.toString(16).padStart(2, '0');
    const b = rgba.b.toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  };

  const hexToRgba = (hex: string, alpha: number = 255): RGBA => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b, a: alpha };
  };

  const rgbaToCss = (rgba: RGBA): string => {
    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a / 255})`;
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = hexToRgba(e.target.value, currentColor.a);
    onColorChange(newColor);
  };

  const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onColorChange({ ...currentColor, a: parseInt(e.target.value) });
  };

  return (
    <div className="color-picker">
      <h3>Colors</h3>
      <div className="color-preview" style={{ background: rgbaToCss(currentColor) }} />
      <input
        type="color"
        className="color-input"
        value={rgbaToHex(currentColor)}
        onChange={handleColorInputChange}
      />
      <div className="alpha-control">
        <label>Alpha: {Math.round((currentColor.a / 255) * 100)}%</label>
        <input
          type="range"
          min="0"
          max="255"
          value={currentColor.a}
          onChange={handleAlphaChange}
          className="alpha-slider"
        />
      </div>
      <div className="color-presets">
        {presetColors.map((color, index) => (
          <button
            key={index}
            className="color-preset"
            style={{ background: rgbaToCss(color) }}
            onClick={() => onColorChange(color)}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;

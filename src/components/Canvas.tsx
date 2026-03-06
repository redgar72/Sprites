import { useRef, useEffect, useState } from 'react';
import { Frame, Tool } from '../App';
import './Canvas.css';

interface CanvasProps {
  width: number;
  height: number;
  scale: number;
  currentTool: Tool;
  currentColor: string;
  frame: Frame;
  currentLayerIndex: number;
  onLayerUpdate: (layerId: string, pixels: Uint8ClampedArray) => void;
  onColorPick?: (color: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  width,
  height,
  scale,
  currentTool,
  currentColor,
  frame,
  currentLayerIndex,
  onLayerUpdate,
  onColorPick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

  const currentLayer = frame.layers[currentLayerIndex];

  useEffect(() => {
    if (!canvasRef.current || !currentLayer) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width * scale}px`;
    canvas.style.height = `${height * scale}px`;
    canvas.style.imageRendering = 'pixelated';

    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;

    frame.layers.forEach(layer => {
      if (layer.visible) {
        for (let i = 0; i < layer.pixels.length; i += 4) {
          const alpha = layer.pixels[i + 3] * layer.opacity;
          if (alpha > 0) {
            const idx = i / 4;
            const pixelIdx = idx * 4;
            pixels[pixelIdx] = layer.pixels[i];
            pixels[pixelIdx + 1] = layer.pixels[i + 1];
            pixels[pixelIdx + 2] = layer.pixels[i + 2];
            pixels[pixelIdx + 3] = alpha;
          }
        }
      }
    });

    ctx.putImageData(imageData, 0, 0);
  }, [frame, width, height, scale, currentLayerIndex, frame.layers.map(l => l.version).join(',')]);

  const hexToRgba = (hex: string): [number, number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b, 255];
  };

  const getPixelPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / scale);
    const y = Math.floor((e.clientY - rect.top) / scale);

    if (x < 0 || x >= width || y < 0 || y >= height) return null;
    return { x, y };
  };

  const setPixel = (x: number, y: number, color: [number, number, number, number]) => {
    if (!currentLayer) return;

    const pixels = new Uint8ClampedArray(currentLayer.pixels);
    const idx = (y * width + x) * 4;
    pixels[idx] = color[0];
    pixels[idx + 1] = color[1];
    pixels[idx + 2] = color[2];
    pixels[idx + 3] = color[3];

    onLayerUpdate(currentLayer.id, pixels);
  };

  const fill = (x: number, y: number, targetColor: [number, number, number, number], fillColor: [number, number, number, number]) => {
    if (!currentLayer) return;

    const pixels = new Uint8ClampedArray(currentLayer.pixels);
    const visited = new Set<string>();
    const stack: Array<{ x: number; y: number }> = [{ x, y }];

    const getColor = (x: number, y: number): [number, number, number, number] => {
      const idx = (y * width + x) * 4;
      return [pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3]];
    };

    const colorsMatch = (a: [number, number, number, number], b: [number, number, number, number]) => {
      return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    };

    while (stack.length > 0) {
      const { x: px, y: py } = stack.pop()!;
      const key = `${px},${py}`;

      if (px < 0 || px >= width || py < 0 || py >= height || visited.has(key)) continue;
      if (!colorsMatch(getColor(px, py), targetColor)) continue;

      visited.add(key);
      const idx = (py * width + px) * 4;
      pixels[idx] = fillColor[0];
      pixels[idx + 1] = fillColor[1];
      pixels[idx + 2] = fillColor[2];
      pixels[idx + 3] = fillColor[3];

      stack.push({ x: px + 1, y: py });
      stack.push({ x: px - 1, y: py });
      stack.push({ x: px, y: py + 1 });
      stack.push({ x: px, y: py - 1 });
    }

    onLayerUpdate(currentLayer.id, pixels);
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number, color: [number, number, number, number]) => {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    let x = x1;
    let y = y1;

    while (true) {
      setPixel(x, y, color);

      if (x === x2 && y === y2) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPixelPos(e);
    if (!pos || !currentLayer) return;

    const color = hexToRgba(currentColor);

    if (currentTool === 'eyedropper') {
      const idx = (pos.y * width + pos.x) * 4;
      const r = currentLayer.pixels[idx].toString(16).padStart(2, '0');
      const g = currentLayer.pixels[idx + 1].toString(16).padStart(2, '0');
      const b = currentLayer.pixels[idx + 2].toString(16).padStart(2, '0');
      const hex = `#${r}${g}${b}`;
      if (onColorPick) {
        onColorPick(hex);
      }
      return;
    }

    setIsDrawing(true);
    setLastPos(pos);

    if (currentTool === 'pencil') {
      setPixel(pos.x, pos.y, color);
    } else if (currentTool === 'eraser') {
      setPixel(pos.x, pos.y, [0, 0, 0, 0]);
    } else if (currentTool === 'fill') {
      const idx = (pos.y * width + pos.x) * 4;
      const targetColor: [number, number, number, number] = [
        currentLayer.pixels[idx],
        currentLayer.pixels[idx + 1],
        currentLayer.pixels[idx + 2],
        currentLayer.pixels[idx + 3]
      ];
      fill(pos.x, pos.y, targetColor, color);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const pos = getPixelPos(e);
    if (!pos || !lastPos) return;

    const color = hexToRgba(currentColor);

    if (currentTool === 'pencil') {
      drawLine(lastPos.x, lastPos.y, pos.x, pos.y, color);
      setLastPos(pos);
    } else if (currentTool === 'eraser') {
      drawLine(lastPos.x, lastPos.y, pos.x, pos.y, [0, 0, 0, 0]);
      setLastPos(pos);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setLastPos(null);
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

export default Canvas;

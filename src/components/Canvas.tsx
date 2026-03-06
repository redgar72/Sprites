import { useRef, useEffect, useState } from 'react';
import { Frame, Tool } from '../App';
import { RGBA } from './ColorPicker';
import './Canvas.css';

interface CanvasProps {
  width: number;
  height: number;
  scale: number;
  currentTool: Tool;
  currentColor: RGBA;
  frame: Frame;
  currentLayerIndex: number;
  onLayerUpdate: (layerId: string, pixels: Uint8ClampedArray) => void;
  onColorPick?: (color: RGBA) => void;
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
  const isMouseDownRef = useRef(false);

  const currentLayer = frame.layers[currentLayerIndex];

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isMouseDownRef.current = false;
      setIsDrawing(false);
      setLastPos(null);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

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

    // Draw checkerboard pattern for transparency
    const checkerSize = 8;
    const lightGray = [200, 200, 200];
    const white = [255, 255, 255];
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const checkX = Math.floor(x / checkerSize);
        const checkY = Math.floor(y / checkerSize);
        const isLight = (checkX + checkY) % 2 === 0;
        const color = isLight ? lightGray : white;
        
        pixels[idx] = color[0];
        pixels[idx + 1] = color[1];
        pixels[idx + 2] = color[2];
        pixels[idx + 3] = 255;
      }
    }

    // Composite layers on top of checkerboard
    frame.layers.forEach(layer => {
      if (layer.visible) {
        for (let i = 0; i < layer.pixels.length; i += 4) {
          const srcR = layer.pixels[i];
          const srcG = layer.pixels[i + 1];
          const srcB = layer.pixels[i + 2];
          const srcA = layer.pixels[i + 3] * layer.opacity;
          
          if (srcA > 0) {
            const idx = i / 4;
            const pixelIdx = idx * 4;
            const dstR = pixels[pixelIdx];
            const dstG = pixels[pixelIdx + 1];
            const dstB = pixels[pixelIdx + 2];
            const dstA = pixels[pixelIdx + 3];
            const srcAlpha = srcA / 255;
            const dstAlpha = dstA / 255;
            const outAlpha = srcAlpha + dstAlpha * (1 - srcAlpha);
            
            if (outAlpha > 0) {
              pixels[pixelIdx] = Math.round((srcR * srcAlpha + dstR * dstAlpha * (1 - srcAlpha)) / outAlpha);
              pixels[pixelIdx + 1] = Math.round((srcG * srcAlpha + dstG * dstAlpha * (1 - srcAlpha)) / outAlpha);
              pixels[pixelIdx + 2] = Math.round((srcB * srcAlpha + dstB * dstAlpha * (1 - srcAlpha)) / outAlpha);
              pixels[pixelIdx + 3] = Math.round(outAlpha * 255);
            }
          }
        }
      }
    });

    ctx.putImageData(imageData, 0, 0);
  }, [frame, width, height, scale, currentLayerIndex, frame.layers.map(l => l.version).join(',')]);

  const rgbaToArray = (rgba: RGBA): [number, number, number, number] => {
    return [rgba.r, rgba.g, rgba.b, rgba.a];
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

    isMouseDownRef.current = true;
    const color = rgbaToArray(currentColor);

    if (currentTool === 'eyedropper') {
      const idx = (pos.y * width + pos.x) * 4;
      const pickedColor: RGBA = {
        r: currentLayer.pixels[idx],
        g: currentLayer.pixels[idx + 1],
        b: currentLayer.pixels[idx + 2],
        a: currentLayer.pixels[idx + 3]
      };
      if (onColorPick) {
        onColorPick(pickedColor);
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

    const color = rgbaToArray(currentColor);

    if (currentTool === 'pencil') {
      drawLine(lastPos.x, lastPos.y, pos.x, pos.y, color);
      setLastPos(pos);
    } else if (currentTool === 'eraser') {
      drawLine(lastPos.x, lastPos.y, pos.x, pos.y, [0, 0, 0, 0]);
      setLastPos(pos);
    }
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    setIsDrawing(false);
    setLastPos(null);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isMouseDownRef.current && !isDrawing) {
      const pos = getPixelPos(e);
      if (pos) {
        setIsDrawing(true);
        setLastPos(pos);
        const color = rgbaToArray(currentColor);
        if (currentTool === 'pencil') {
          setPixel(pos.x, pos.y, color);
        } else if (currentTool === 'eraser') {
          setPixel(pos.x, pos.y, [0, 0, 0, 0]);
        }
      }
    }
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseEnter={handleMouseEnter}
      />
    </div>
  );
};

export default Canvas;

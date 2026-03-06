import { useState } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import LayersPanel from './components/LayersPanel';
import FramesPanel from './components/FramesPanel';
import ColorPicker from './components/ColorPicker';
import './App.css';

export type Tool = 'pencil' | 'eraser' | 'fill' | 'eyedropper';
export type Layer = {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  pixels: Uint8ClampedArray;
  version: number;
};

export type Frame = {
  id: string;
  layers: Layer[];
};

function App() {
  const [currentTool, setCurrentTool] = useState<Tool>('pencil');
  const [currentColor, setCurrentColor] = useState('#ffffff');
  const [canvasSize] = useState({ width: 32, height: 32 });
  const [frames, setFrames] = useState<Frame[]>([
    {
      id: '1',
      layers: [
        {
          id: '1',
          name: 'Layer 1',
          visible: true,
          opacity: 1,
          pixels: new Uint8ClampedArray(32 * 32 * 4).fill(0),
          version: 0
        }
      ]
    }
  ]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);

  const currentFrame = frames[currentFrameIndex];

  const updateLayer = (layerId: string, pixels: Uint8ClampedArray) => {
    setFrames(prev => {
      const newFrames = [...prev];
      const frame = { ...newFrames[currentFrameIndex] };
      const layerIndex = frame.layers.findIndex(l => l.id === layerId);
      if (layerIndex !== -1) {
        frame.layers = [...frame.layers];
        frame.layers[layerIndex] = {
          ...frame.layers[layerIndex],
          pixels: new Uint8ClampedArray(pixels),
          version: (frame.layers[layerIndex].version || 0) + 1
        };
      }
      newFrames[currentFrameIndex] = frame;
      return newFrames;
    });
  };

  const addFrame = () => {
    const newFrame: Frame = {
      id: Date.now().toString(),
      layers: [
        {
          id: Date.now().toString(),
          name: 'Layer 1',
          visible: true,
          opacity: 1,
          pixels: new Uint8ClampedArray(canvasSize.width * canvasSize.height * 4).fill(0),
          version: 0
        }
      ]
    };
    setFrames([...frames, newFrame]);
    setCurrentFrameIndex(frames.length);
  };

  const addLayer = () => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      name: `Layer ${currentFrame.layers.length + 1}`,
      visible: true,
      opacity: 1,
      pixels: new Uint8ClampedArray(canvasSize.width * canvasSize.height * 4).fill(0),
      version: 0
    };
    setFrames(prev => {
      const newFrames = [...prev];
      const frame = { ...newFrames[currentFrameIndex] };
      frame.layers = [...frame.layers, newLayer];
      newFrames[currentFrameIndex] = frame;
      return newFrames;
    });
  };

  const toggleLayerVisibility = (layerId: string) => {
    setFrames(prev => {
      const newFrames = [...prev];
      const frame = { ...newFrames[currentFrameIndex] };
      const layerIndex = frame.layers.findIndex(l => l.id === layerId);
      if (layerIndex !== -1) {
        frame.layers = [...frame.layers];
        frame.layers[layerIndex] = {
          ...frame.layers[layerIndex],
          visible: !frame.layers[layerIndex].visible
        };
      }
      newFrames[currentFrameIndex] = frame;
      return newFrames;
    });
  };

  const renderFrameToCanvas = (frame: Frame): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const imageData = ctx.createImageData(canvasSize.width, canvasSize.height);
    const pixels = imageData.data;

    frame.layers.forEach(layer => {
      if (layer.visible) {
        for (let i = 0; i < layer.pixels.length; i += 4) {
          const alpha = layer.pixels[i + 3] * layer.opacity;
          if (alpha > 0) {
            pixels[i] = layer.pixels[i];
            pixels[i + 1] = layer.pixels[i + 1];
            pixels[i + 2] = layer.pixels[i + 2];
            pixels[i + 3] = alpha;
          }
        }
      }
    });

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };

  const exportImage = () => {
    const canvas = renderFrameToCanvas(currentFrame);
    canvas.toBlob(blob => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sprite.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  const exportGif = async () => {
    const GIF = (await import('gif.js')).default;
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: canvasSize.width,
      height: canvasSize.height
    }) as any;

    frames.forEach(frame => {
      const canvas = renderFrameToCanvas(frame);
      gif.addFrame(canvas, { delay: 100 });
    });

    gif.on('finished', (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sprite.gif';
      a.click();
      URL.revokeObjectURL(url);
    });

    gif.render();
  };

  const exportSpritesheet = () => {
    const cols = Math.ceil(Math.sqrt(frames.length));
    const rows = Math.ceil(frames.length / cols);
    const sheetWidth = canvasSize.width * cols;
    const sheetHeight = canvasSize.height * rows;

    const canvas = document.createElement('canvas');
    canvas.width = sheetWidth;
    canvas.height = sheetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    frames.forEach((frame, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * canvasSize.width;
      const y = row * canvasSize.height;

      const frameCanvas = renderFrameToCanvas(frame);
      ctx.drawImage(frameCanvas, x, y);
    });

    canvas.toBlob(blob => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'spritesheet.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  return (
    <div className="app">
      <div className="app-header">
        <h1>Sprite Editor</h1>
        <div className="export-buttons">
          <button onClick={exportImage} className="export-btn">Export PNG</button>
          <button onClick={exportGif} className="export-btn">Export GIF</button>
          <button onClick={exportSpritesheet} className="export-btn">Export Spritesheet</button>
        </div>
      </div>
      <div className="app-content">
        <div className="left-panel">
          <Toolbar currentTool={currentTool} onToolChange={setCurrentTool} />
          <ColorPicker currentColor={currentColor} onColorChange={setCurrentColor} />
        </div>
        <div className="center-panel">
          <Canvas
            width={canvasSize.width}
            height={canvasSize.height}
            scale={16}
            currentTool={currentTool}
            currentColor={currentColor}
            frame={currentFrame}
            currentLayerIndex={currentLayerIndex}
            onLayerUpdate={updateLayer}
            onColorPick={setCurrentColor}
          />
        </div>
        <div className="right-panel">
          <LayersPanel
            layers={currentFrame.layers}
            currentLayerIndex={currentLayerIndex}
            onLayerSelect={setCurrentLayerIndex}
            onLayerVisibilityToggle={toggleLayerVisibility}
            onAddLayer={addLayer}
          />
          <FramesPanel
            frames={frames}
            currentFrameIndex={currentFrameIndex}
            onFrameSelect={setCurrentFrameIndex}
            onAddFrame={addFrame}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

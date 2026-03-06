declare module 'gif.js' {
  interface GIFOptions {
    workers?: number;
    quality?: number;
    width: number;
    height: number;
    workerScript?: string;
    background?: string;
    transparent?: string;
    dither?: boolean;
    palette?: number[];
    repeat?: number;
  }

  interface GIF {
    addFrame(canvas: HTMLCanvasElement | CanvasRenderingContext2D, options?: { delay?: number; copy?: boolean }): void;
    on(event: 'finished', callback: (blob: Blob) => void): void;
    on(event: 'progress', callback: (progress: number) => void): void;
    render(): void;
    out: {
      getData(): Blob;
    };
  }

  class GIF {
    constructor(options: GIFOptions);
  }

  export = GIF;
}

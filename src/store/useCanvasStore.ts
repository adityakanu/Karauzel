import { create } from 'zustand';

interface CanvasState {
  slideCount: number;
  canvasHeight: number;
  backgroundColor: string;
  scale: number;
  position: { x: number; y: number };
  layers: LayerData[];
  selectedIds: string[];
  setSlideCount: (count: number) => void;
  setCanvasHeight: (height: number) => void;
  setBackgroundColor: (color: string) => void;
  setScale: (scale: number) => void;
  setPosition: (pos: { x: number; y: number }) => void;
  addLayer: (layer: LayerData) => void;
  addLayers: (layers: LayerData[]) => void;
  updateLayer: (id: string, attrs: Partial<LayerData>) => void;
  removeLayer: (id: string) => void;
  moveLayer: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  setSelectedIds: (ids: string[]) => void;
}

export interface LayerData {
  id: string;
  type: 'image' | 'text' | 'shape';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  content?: string; // URL for image, text content for text
  fill?: string;
  fontFamily?: string;
  fontStyle?: string; // 'normal', 'italic', 'bold', 'italic bold'
  textDecoration?: string; // 'underline', 'line-through', ''
  align?: string; // 'left', 'center', 'right'
  variant?: 'default' | 'polaroid' | 'vintage';
  padding?: number;
  borderRadius?: number;
  cropScale?: number;
  cropX?: number;
  cropY?: number;
  [key: string]: any;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  slideCount: 3, // Default to 3 slides
  canvasHeight: 1080,
  backgroundColor: '#ffffff',
  scale: 0.5,
  position: { x: 100, y: 100 },
  layers: [],
  selectedIds: [],
  setSlideCount: (count) => set({ slideCount: count }),
  setCanvasHeight: (height) => set({ canvasHeight: height }),
  setBackgroundColor: (color) => set({ backgroundColor: color }),
  setScale: (scale) => set({ scale }),
  setPosition: (position) => set({ position }),
  addLayer: (layer) => set((state) => ({ layers: [...state.layers, layer] })),
  addLayers: (newLayers) => set((state) => ({ layers: [...state.layers, ...newLayers] })),
  updateLayer: (id, attrs) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, ...attrs } : layer
      ),
    })),
  removeLayer: (id) =>
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== id),
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
    })),
  moveLayer: (id, direction) =>
    set((state) => {
      const index = state.layers.findIndex((l) => l.id === id);
      if (index === -1) return state;
      const newLayers = [...state.layers];
      const [layer] = newLayers.splice(index, 1);

      if (direction === 'top') {
        newLayers.push(layer);
      } else if (direction === 'bottom') {
        newLayers.unshift(layer);
      } else if (direction === 'up') {
        newLayers.splice(Math.min(index + 1, newLayers.length), 0, layer);
      } else if (direction === 'down') {
        newLayers.splice(Math.max(index - 1, 0), 0, layer);
      }

      return { layers: newLayers };
    }),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
}));

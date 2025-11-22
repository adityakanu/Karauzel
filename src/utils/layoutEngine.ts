import type { LayerData } from '../store/useCanvasStore';

const generateId = () => Math.random().toString(36).substr(2, 9);

export interface LayoutItem {
    x: number;      // Relative to slide (0-1080)
    y: number;      // Relative to slide
    width: number;
    height: number;
    type: 'image' | 'text' | 'shape';
    variant?: 'default' | 'polaroid' | 'vintage';
    content?: string;
    fill?: string;
    rotation?: number;
}

export interface LayoutTemplate {
    id: string;
    name: string;
    items: LayoutItem[];
}

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
    {
        id: 'single-full',
        name: 'Full Screen',
        items: [
            { x: 0, y: 0, width: 1080, height: 1080, type: 'image', variant: 'default' } // Height will be adjusted dynamically if needed
        ]
    },
    {
        id: 'polaroid-center',
        name: 'Polaroid Center',
        items: [
            { x: 140, y: 140, width: 800, height: 1000, type: 'image', variant: 'polaroid' }
        ]
    },
    {
        id: 'grid-2x2',
        name: '2x2 Grid',
        items: [
            { x: 50, y: 50, width: 465, height: 465, type: 'image', variant: 'default' },
            { x: 565, y: 50, width: 465, height: 465, type: 'image', variant: 'default' },
            { x: 50, y: 565, width: 465, height: 465, type: 'image', variant: 'default' },
            { x: 565, y: 565, width: 465, height: 465, type: 'image', variant: 'default' }
        ]
    },
    {
        id: 'vintage-collage',
        name: 'Vintage Split',
        items: [
            { x: 50, y: 50, width: 980, height: 600, type: 'image', variant: 'vintage' },
            { x: 50, y: 700, width: 465, height: 330, type: 'image', variant: 'vintage' },
            { x: 565, y: 700, width: 465, height: 330, type: 'image', variant: 'vintage' }
        ]
    },
    {
        id: 'panoramic-bridge',
        name: 'Panoramic Bridge',
        items: [
            // This item starts on the current slide but extends 500px into the NEXT slide
            // Width = 1080 (current) + 500 (next) = 1580
            { x: 100, y: 200, width: 1580, height: 800, type: 'image', variant: 'default' }
        ]
    }
];

export const applyLayout = (
    templateId: string, 
    slideIndex: number, 
    slideWidth: number = 1080,
    slideHeight: number = 1080
): LayerData[] => {
    const template = LAYOUT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return [];

    return template.items.map(item => {
        // Calculate absolute X position based on slide index
        const absoluteX = (slideIndex * slideWidth) + item.x;
        
        // Adjust height if item was defined for 1080 but canvas is taller, 
        // unless it's a specific fixed size design. 
        // For simplicity, we'll keep defined heights for now, 
        // but for 'full' items we might want to match slideHeight.
        let height = item.height;
        if (item.height === 1080 && slideHeight !== 1080) {
             // If it was full height, scale it? Or just keep it?
             // Let's keep it simple for now.
        }

        return {
            id: generateId(),
            type: item.type,
            x: absoluteX,
            y: item.y,
            width: item.width,
            height: height,
            rotation: item.rotation || 0,
            variant: item.variant,
            content: item.content, // Usually undefined for new layout
            fill: item.fill || '#e2e8f0', // Placeholder gray
            scaleX: 1,
            scaleY: 1,
        };
    });
};

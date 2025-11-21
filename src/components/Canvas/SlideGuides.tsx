import React from 'react';
import { Group, Line, Rect, Text } from 'react-konva';

interface SlideGuidesProps {
    slideCount: number;
    height?: number; // Default 1080
    backgroundColor?: string;
}

const SLIDE_WIDTH = 1080;
const SLIDE_HEIGHT = 1080;

export const SlideGuides: React.FC<SlideGuidesProps> = ({ slideCount, height = SLIDE_HEIGHT, backgroundColor = '#ffffff' }) => {
    // Simple luminance check to decide guide color
    const getContrastColor = (hexColor: string) => {
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
    };

    const guideColor = getContrastColor(backgroundColor);
    const textColor = getContrastColor(backgroundColor).replace('0.3', '0.6'); // Slightly more opaque for text

    const guides = [];

    for (let i = 1; i < slideCount; i++) {
        const x = i * SLIDE_WIDTH;
        guides.push(
            <Group key={i}>
                <Line
                    points={[x, 0, x, height]}
                    stroke={guideColor}
                    strokeWidth={2}
                    dash={[10, 10]}
                />
                <Text
                    x={x + 20}
                    y={-60}
                    text={`Slide ${i} / ${i + 1}`}
                    fontSize={48}
                    fill={textColor}
                    fontFamily="Hina Mincho"
                />
            </Group>
        );
    }

    // Outline for the entire carousel
    const totalWidth = slideCount * SLIDE_WIDTH;

    return (
        <Group>
            {/* Background for the carousel area */}
            <Rect
                x={0}
                y={0}
                width={totalWidth}
                height={height}
                fill={backgroundColor}
            />
            <Line
                points={[0, 0, totalWidth, 0, totalWidth, height, 0, height, 0, 0]}
                stroke={guideColor}
                strokeWidth={1}
                closed
            />
            {guides}
        </Group>
    );
};

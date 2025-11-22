import Konva from 'konva';
import React, { useMemo, useRef } from 'react';
import { Group, Image as KonvaImage, Rect } from 'react-konva';
import useImage from 'use-image';
import { calculateCrop } from '../../../utils/imageUtils';

interface SkinProps {
    width: number;
    height: number;
    content?: string;
    padding?: number;
    borderRadius?: number;
    fill?: string;
    cropScale?: number;
    cropX?: number;
    cropY?: number;
    isCropping?: boolean;
    onCropChange?: (x: number, y: number) => void;
}

export const DefaultSkin: React.FC<SkinProps> = ({
    width, height, content, borderRadius = 0,
    cropScale = 1, cropX = 0, cropY = 0, isCropping = false, onCropChange
}) => {
    const [img] = useImage(content || '', 'anonymous');
    const dragStartRef = useRef<{ x: number, y: number } | null>(null);

    const crop = useMemo(() => {
        if (!img) return undefined;
        return calculateCrop(img.width, img.height, width, height, cropScale, cropX, cropY);
    }, [img, width, height, cropScale, cropX, cropY]);

    const ghostProps = useMemo(() => {
        if (!crop || !img || !isCropping) return null;
        // The crop rect represents the part of the image currently visible in the frame (width/height).
        // We want to show the FULL image such that the cropped part aligns with the frame.
        // Scale factor: The frame width corresponds to crop.width pixels of the image.
        const scale = width / crop.width;

        return {
            image: img,
            x: -crop.x * scale,
            y: -crop.y * scale,
            width: img.width * scale,
            height: img.height * scale,
            opacity: 0.3,
            listening: false, // Don't interfere with interactions
            filters: [Konva.Filters.Grayscale], // Optional: make it grayscale to distinguish
        };
    }, [crop, img, isCropping, width]);

    return (
        <Group>
            {/* Ghost Image (Full Context) */}
            {ghostProps && (
                <KonvaImage {...ghostProps} />
            )}

            {/* Clip Group for Image */}
            <Group
                clipFunc={(ctx) => {
                    ctx.beginPath();
                    ctx.roundRect(0, 0, width, height, borderRadius);
                    ctx.closePath();
                }}
            >
                {/* Placeholder Background */}
                <Rect
                    width={width}
                    height={height}
                    fill="#e2e8f0"
                />
                <KonvaImage
                    image={img}
                    width={width}
                    height={height}
                    crop={crop}
                />
                {/* Drag Handler Overlay */}
                {isCropping && (
                    <Rect
                        width={width}
                        height={height}
                        fill="transparent"
                        draggable
                        onDragStart={(e) => {
                            e.cancelBubble = true;
                            dragStartRef.current = { x: cropX, y: cropY };
                        }}
                        onDragMove={(e) => {
                            e.cancelBubble = true;
                            if (!img || !onCropChange || !crop || !dragStartRef.current) return;
                            const scaleFactor = crop.width / width;
                            const node = e.target;
                            const dx = node.x();
                            const dy = node.y();

                            // Pan Logic: Reversed as per user request (Drag Right -> Image Moves Left)
                            onCropChange(
                                dragStartRef.current.x + dx * scaleFactor,
                                dragStartRef.current.y + dy * scaleFactor
                            );
                        }}
                        onDragEnd={(e) => {
                            e.cancelBubble = true;
                            e.target.position({ x: 0, y: 0 });
                            dragStartRef.current = null;
                        }}
                    />
                )}
            </Group>
            {/* Optional Border if needed, or just clean image */}
        </Group>
    );
};

export const PolaroidSkin: React.FC<SkinProps> = ({
    width, height, content, padding = 20,
    cropScale = 1, cropX = 0, cropY = 0, isCropping = false, onCropChange
}) => {
    const [img] = useImage(content || '', 'anonymous');
    const dragStartRef = useRef<{ x: number, y: number } | null>(null);
    const bottomPadding = padding * 3; // More space at bottom for polaroid look

    const innerWidth = width - (padding * 2);
    const innerHeight = height - (padding + bottomPadding);

    const crop = useMemo(() => {
        if (!img) return undefined;
        return calculateCrop(img.width, img.height, innerWidth, innerHeight, cropScale, cropX, cropY);
    }, [img, innerWidth, innerHeight, cropScale, cropX, cropY]);

    const ghostProps = useMemo(() => {
        if (!crop || !img || !isCropping) return null;
        const scale = innerWidth / crop.width;
        return {
            image: img,
            x: padding + (-crop.x * scale), // Offset by padding
            y: padding + (-crop.y * scale),
            width: img.width * scale,
            height: img.height * scale,
            opacity: 0.3,
            listening: false,
            filters: [Konva.Filters.Grayscale],
        };
    }, [crop, img, isCropping, innerWidth, padding]);

    return (
        <Group>
            {/* Ghost Image behind everything? Or just behind the card? 
                Usually behind the card looks weird if card is opaque.
                But user wants to see "what will be in the frame".
                If we put it behind the card, the card covers it.
                We should probably render it ON TOP of the card background but BEHIND the inner image?
                Or just globally behind.
                Let's put it globally behind for now, so it bleeds out.
            */}
            {ghostProps && <KonvaImage {...ghostProps} />}

            {/* White Card Background with Shadow */}
            <Rect
                width={width}
                height={height}
                fill="#ffffff"
                shadowColor="black"
                shadowBlur={10}
                shadowOpacity={0.1}
                shadowOffset={{ x: 2, y: 4 }}
            />

            {/* Inner Image */}
            <Group
                x={padding}
                y={padding}
                clipFunc={(ctx) => {
                    ctx.beginPath();
                    ctx.rect(0, 0, innerWidth, innerHeight);
                    ctx.closePath();
                }}
            >
                {/* Placeholder */}
                <Rect width={innerWidth} height={innerHeight} fill="#e2e8f0" />

                <KonvaImage
                    width={innerWidth}
                    height={innerHeight}
                    image={img}
                    crop={crop}
                />
                {/* Drag Handler Overlay */}
                {isCropping && (
                    <Rect
                        width={innerWidth}
                        height={innerHeight}
                        fill="transparent"
                        draggable
                        onDragStart={(e) => {
                            e.cancelBubble = true;
                            dragStartRef.current = { x: cropX, y: cropY };
                        }}
                        onDragMove={(e) => {
                            e.cancelBubble = true;
                            if (!img || !onCropChange || !crop || !dragStartRef.current) return;
                            const scaleFactor = crop.width / innerWidth;
                            const node = e.target;
                            const dx = node.x();
                            const dy = node.y();

                            // Pan Logic: Reversed as per user request (Drag Right -> Image Moves Left)
                            onCropChange(
                                dragStartRef.current.x + dx * scaleFactor,
                                dragStartRef.current.y + dy * scaleFactor
                            );
                        }}
                        onDragEnd={(e) => {
                            e.cancelBubble = true;
                            e.target.position({ x: 0, y: 0 });
                            dragStartRef.current = null;
                        }}
                    />
                )}
            </Group>
        </Group>
    );
};

export const VintageSkin: React.FC<SkinProps> = ({
    width, height, content, borderRadius = 0,
    cropScale = 1, cropX = 0, cropY = 0, isCropping = false, onCropChange
}) => {
    const [img] = useImage(content || '', 'anonymous');
    const dragStartRef = useRef<{ x: number, y: number } | null>(null);

    const crop = useMemo(() => {
        if (!img) return undefined;
        return calculateCrop(img.width, img.height, width, height, cropScale, cropX, cropY);
    }, [img, width, height, cropScale, cropX, cropY]);

    const ghostProps = useMemo(() => {
        if (!crop || !img || !isCropping) return null;
        const scale = width / crop.width;
        return {
            image: img,
            x: -crop.x * scale,
            y: -crop.y * scale,
            width: img.width * scale,
            height: img.height * scale,
            opacity: 0.3,
            listening: false,
            filters: [Konva.Filters.Grayscale],
        };
    }, [crop, img, isCropping, width]);

    return (
        <Group>
            {ghostProps && <KonvaImage {...ghostProps} />}

            <Group
                clipFunc={(ctx) => {
                    ctx.beginPath();
                    ctx.roundRect(0, 0, width, height, borderRadius);
                    ctx.closePath();
                }}
            >
                {/* Placeholder Background */}
                <Rect
                    width={width}
                    height={height}
                    fill="#e2e8f0"
                />
                <KonvaImage
                    image={img}
                    width={width}
                    height={height}
                    opacity={0.9} // Slight fade
                    crop={crop}
                />
                {/* Drag Handler Overlay */}
                {isCropping && (
                    <Rect
                        width={width}
                        height={height}
                        fill="transparent"
                        draggable
                        onDragStart={(e) => {
                            e.cancelBubble = true;
                            dragStartRef.current = { x: cropX, y: cropY };
                        }}
                        onDragMove={(e) => {
                            e.cancelBubble = true;
                            if (!img || !onCropChange || !crop || !dragStartRef.current) return;
                            const scaleFactor = crop.width / width;
                            const node = e.target;
                            const dx = node.x();
                            const dy = node.y();

                            // Pan Logic: Reversed as per user request (Drag Right -> Image Moves Left)
                            onCropChange(
                                dragStartRef.current.x + dx * scaleFactor,
                                dragStartRef.current.y + dy * scaleFactor
                            );
                        }}
                        onDragEnd={(e) => {
                            e.cancelBubble = true;
                            e.target.position({ x: 0, y: 0 });
                            dragStartRef.current = null;
                        }}
                    />
                )}
            </Group>

            {/* Sepia/Vintage Overlay Effect */}
            <Rect
                width={width}
                height={height}
                fill="#704214"
                opacity={0.2}
                listening={false}
                cornerRadius={borderRadius}
            />

            {/* Border */}
            <Rect
                width={width}
                height={height}
                stroke="#5c4033"
                strokeWidth={4}
                cornerRadius={borderRadius}
                listening={false}
            />
        </Group>
    );
};

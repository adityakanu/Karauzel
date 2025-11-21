import Konva from 'konva';
import React, { useEffect, useRef } from 'react';
import { Circle, Image as KonvaImage, Layer, Rect, Stage, Text } from 'react-konva';
import useImage from 'use-image';
import { useCanvasStore } from '../../store/useCanvasStore';
import { SlideGuides } from './SlideGuides';
import { Transformer } from './Transformer';

// Helper component to render individual layers
const CanvasLayer = ({ layer, isSelected, onSelect, onChange }: any) => {
    const shapeRef = useRef<Konva.Shape>(null);
    const [img] = useImage(layer.content || '', 'anonymous');

    useEffect(() => {
        if (isSelected && shapeRef.current) {
            // We don't need to do anything here manually for transformer, 
            // the Transformer component handles attaching nodes.
        }
    }, [isSelected]);

    const commonProps = {
        id: layer.id,
        x: layer.x,
        y: layer.y,
        width: layer.width,
        height: layer.height,
        rotation: layer.rotation,
        scaleX: layer.scaleX,
        scaleY: layer.scaleY,
        draggable: true,
        onClick: onSelect,
        onTap: onSelect,
        onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
            onChange({
                x: e.target.x(),
                y: e.target.y(),
            });
        },
        onTransformEnd: () => {
            const node = shapeRef.current;
            if (!node) return;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            // Reset scale to 1 and adjust width/height for consistent data model if desired,
            // OR just save scale. Saving scale is often easier for images.
            onChange({
                x: node.x(),
                y: node.y(),
                rotation: node.rotation(),
                scaleX: scaleX,
                scaleY: scaleY,
            });
        },
    };

    if (layer.type === 'image') {
        return (
            <KonvaImage
                {...commonProps}
                ref={shapeRef as any}
                image={img}
            />
        );
    }

    if (layer.type === 'shape') {
        if (layer.shapeType === 'circle') {
            return (
                <Circle
                    {...commonProps}
                    ref={shapeRef as any}
                    fill={layer.fill || '#3b82f6'}
                    radius={layer.width / 2} // Use width as diameter roughly
                // Circle uses radius, not width/height for size usually, but transformer sets scale.
                // If we want to resize circle with transformer, it scales it.
                />
            );
        }
        return (
            <Rect
                {...commonProps}
                ref={shapeRef as any}
                fill={layer.fill || '#3b82f6'}
            />
        );
    }

    if (layer.type === 'text') {
        return (
            <Text
                {...commonProps}
                ref={shapeRef as any}
                text={layer.text || 'Text'}
                fontSize={layer.fontSize || 24}
                fill={layer.fill || 'black'}
                fontFamily={layer.fontFamily || 'Inter'}
                fontStyle={layer.fontStyle || 'normal'}
                textDecoration={layer.textDecoration || ''}
                onDblClick={() => {
                    // Simple prompt for MVP
                    const newText = prompt('Edit text:', layer.text);
                    if (newText !== null) {
                        onChange({ text: newText });
                    }
                }}
            />
        );
    }

    return null;
};

export const StageWrapper: React.FC = () => {
    const {
        slideCount,
        canvasHeight,
        backgroundColor,
        scale,
        position,
        layers,
        selectedIds,
        setScale,
        setPosition,
        setSelectedIds,
        updateLayer
    } = useCanvasStore();
    const stageRef = useRef<Konva.Stage>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle Window Resize
    const [size, setSize] = React.useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Zoom Logic (Wheel)
    const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        const stage = stageRef.current;
        if (!stage) return;

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const scaleBy = 1.1;
        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

        // Limit scale
        if (newScale < 0.1 || newScale > 5) return;

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        setScale(newScale);
        setPosition(newPos);
    };

    // Drag Logic (Pan)
    // We use built-in draggable of Stage, but we need to sync with store
    // Actually, for infinite canvas, Stage draggable is perfect.
    // We just need to update store on drag end/move so UI stays in sync if needed.

    // Selection Logic
    const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        // deselect when clicked on empty area
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            setSelectedIds([]);
        }
    };

    // Drag and Drop Logic
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const stage = stageRef.current;
        if (!stage) return;

        stage.setPointersPositions(e);
        const pointerPosition = stage.getPointerPosition();

        if (!pointerPosition) return;

        // Convert pointer position to stage coordinates (accounting for zoom/pan)
        const stageX = (pointerPosition.x - stage.x()) / stage.scaleX();
        const stageY = (pointerPosition.y - stage.y()) / stage.scaleY();

        const files = Array.from(e.dataTransfer.files);

        files.forEach((file) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                    const img = new Image();
                    img.src = reader.result as string;
                    img.onload = () => {
                        // Calculate dimensions to fit nicely if too big, or just use native
                        // For now, let's limit max width to 500px for initial drop
                        let width = img.width;
                        let height = img.height;
                        const maxSize = 500;
                        if (width > maxSize || height > maxSize) {
                            const ratio = width / height;
                            if (width > height) {
                                width = maxSize;
                                height = maxSize / ratio;
                            } else {
                                height = maxSize;
                                width = maxSize * ratio;
                            }
                        }

                        const newLayer = {
                            id: crypto.randomUUID(),
                            type: 'image' as const,
                            x: stageX - width / 2, // Center on mouse
                            y: stageY - height / 2,
                            width,
                            height,
                            content: reader.result as string,
                            rotation: 0,
                            scaleX: 1,
                            scaleY: 1,
                        };
                        useCanvasStore.getState().addLayer(newLayer);
                    };
                };
                reader.readAsDataURL(file);
            }
        });
    };

    return (
        <div
            className="w-full h-full overflow-hidden"
            ref={containerRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <Stage
                ref={stageRef}
                width={size.width}
                height={size.height}
                draggable
                onWheel={handleWheel}
                scaleX={scale}
                scaleY={scale}
                x={position.x}
                y={position.y}
                onDragEnd={(e) => {
                    // Only update stage position if the target is the stage itself
                    // However, e.target is the node that is dragged.
                    // If we drag a shape, e.target is the shape.
                    // If we drag the stage (pan), e.target is the stage.
                    if (e.target === stageRef.current) {
                        setPosition({ x: e.target.x(), y: e.target.y() });
                    }
                }}
                onMouseDown={checkDeselect}
                onTouchStart={checkDeselect}
            >
                <Layer>
                    <SlideGuides slideCount={slideCount} height={canvasHeight} backgroundColor={backgroundColor} />
                    {layers.map((layer) => (
                        <CanvasLayer
                            key={layer.id}
                            layer={layer}
                            isSelected={selectedIds.includes(layer.id)}
                            onSelect={() => setSelectedIds([layer.id])}
                            onChange={(newAttrs: any) => updateLayer(layer.id, newAttrs)}
                        />
                    ))}
                    <Transformer selectedIds={selectedIds} />
                </Layer>
            </Stage>
        </div>
    );
};

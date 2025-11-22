import Konva from 'konva';
import React, { useEffect, useRef } from 'react';
import { Group, Rect } from 'react-konva';
import { DefaultSkin, PolaroidSkin, VintageSkin } from './FrameSkins';

interface SmartFrameProps {
    layer: any; // Using any for now to match LayerData structure passed down
    isSelected: boolean;
    onSelect: () => void;
    onChange: (newAttrs: any) => void;
}

export const SmartFrame: React.FC<SmartFrameProps> = ({ layer, isSelected, onSelect, onChange }) => {
    const groupRef = useRef<Konva.Group>(null);
    const [isCropping, setIsCropping] = React.useState(false);

    useEffect(() => {
        if (!isSelected) {
            setIsCropping(false);
        }
    }, [isSelected]);

    const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
        // Only update if the drag event comes from this group (the frame itself)
        if (e.target === groupRef.current) {
            onChange({
                x: e.target.x(),
                y: e.target.y(),
            });
        }
    };

    const handleTransformEnd = () => {
        const node = groupRef.current;
        if (!node) return;

        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        const newWidth = Math.max(5, node.width() * scaleX);
        const newHeight = Math.max(5, node.height() * scaleY);

        node.scaleX(1);
        node.scaleY(1);

        onChange({
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: newWidth,
            height: newHeight,
            scaleX: 1,
            scaleY: 1,
        });
    };

    const renderSkin = () => {
        const props = {
            width: layer.width,
            height: layer.height,
            content: layer.content,
            padding: layer.padding,
            borderRadius: layer.borderRadius,
            fill: layer.fill,
            cropScale: layer.cropScale || 1,
            cropX: layer.cropX || 0,
            cropY: layer.cropY || 0,
            isCropping,
            onCropChange: (x: number, y: number) => {
                onChange({ cropX: x, cropY: y });
            }
        };

        switch (layer.variant) {
            case 'polaroid':
                return <PolaroidSkin {...props} />;
            case 'vintage':
                return <VintageSkin {...props} />;
            case 'default':
            default:
                return <DefaultSkin {...props} />;
        }
    };

    return (
        <Group
            id={layer.id}
            x={layer.x}
            y={layer.y}
            width={layer.width}
            height={layer.height}
            rotation={layer.rotation}
            draggable={!isCropping} // Disable frame drag when cropping
            onClick={onSelect}
            onTap={onSelect}
            onDblClick={() => setIsCropping(!isCropping)}
            onDragEnd={handleDragEnd}
            onTransformEnd={handleTransformEnd}
            onWheel={(e) => {
                if (isCropping) {
                    e.evt.preventDefault(); // Prevent page scroll
                    e.cancelBubble = true; // Prevent stage zoom
                    const scaleBy = 1.05;
                    const oldScale = layer.cropScale || 1;
                    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

                    // Clamp scale
                    const clampedScale = Math.max(1, Math.min(newScale, 5));

                    onChange({ cropScale: clampedScale });
                }
            }}
            ref={groupRef}
        >
            {renderSkin()}

            {/* Transparent Hit Area for consistent selection */}
            {!isCropping && (
                <Rect
                    width={layer.width}
                    height={layer.height}
                    fill="transparent"
                />
            )}
        </Group>
    );
};

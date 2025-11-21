import Konva from 'konva';
import React, { useEffect, useRef } from 'react';
import { Transformer as KonvaTransformer } from 'react-konva';

interface TransformerProps {
    selectedIds: string[];
}

export const Transformer: React.FC<TransformerProps> = ({ selectedIds }) => {
    const trRef = useRef<Konva.Transformer>(null);

    useEffect(() => {
        if (!trRef.current) return;

        const stage = trRef.current.getStage();
        if (!stage) return;

        const selectedNodes = selectedIds
            .map((id) => stage.findOne('#' + id))
            .filter((node): node is Konva.Node => node !== undefined);

        trRef.current.nodes(selectedNodes);
        trRef.current.getLayer()?.batchDraw();
    }, [selectedIds]);

    return (
        <KonvaTransformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
                // Limit resize logic if needed (e.g., min width)
                if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                }
                return newBox;
            }}
        />
    );
};

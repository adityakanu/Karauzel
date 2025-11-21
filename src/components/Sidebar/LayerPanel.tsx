import clsx from 'clsx';
import { ArrowDown, ArrowUp, Circle as CircleIcon, Image as ImageIcon, Square, Trash2, Type } from 'lucide-react';
import React from 'react';
import { useCanvasStore, type LayerData } from '../../store/useCanvasStore';

export const LayerPanel: React.FC = () => {
    const { layers, selectedIds, setSelectedIds, removeLayer, moveLayer } = useCanvasStore();

    // Reverse layers for display so top layer is at top of list
    const displayLayers = [...layers].reverse();

    const getIcon = (type: LayerData['type'], shapeType?: string) => {
        if (type === 'image') return <ImageIcon size={14} />;
        if (type === 'text') return <Type size={14} />;
        if (type === 'shape') {
            if (shapeType === 'circle') return <CircleIcon size={14} />;
            return <Square size={14} />;
        }
        return <Square size={14} />;
    };

    const getName = (layer: LayerData) => {
        if (layer.type === 'text') return layer.text || 'Text';
        if (layer.type === 'image') return 'Image';
        if (layer.type === 'shape') return layer.shapeType === 'circle' ? 'Circle' : 'Rectangle';
        return 'Layer';
    };

    return (
        <div className="w-72 m-4 bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-400/20 font-semibold text-sm text-gray-700">
                Layers
            </div>
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
                {displayLayers.length === 0 && (
                    <div className="text-center text-gray-400 text-xs mt-10">
                        No layers yet
                    </div>
                )}
                {displayLayers.map((layer) => {
                    const isSelected = selectedIds.includes(layer.id);
                    return (
                        <div
                            key={layer.id}
                            onClick={() => setSelectedIds([layer.id])}
                            className={clsx(
                                "flex items-center gap-2 p-2 rounded-xl cursor-pointer text-sm transition-colors group",
                                isSelected ? "bg-white/60 text-blue-700 shadow-sm" : "hover:bg-white/40 text-gray-700"
                            )}
                        >
                            <div className="text-gray-400">
                                {getIcon(layer.type, layer.shapeType)}
                            </div>
                            <div className="flex-1 truncate select-none">
                                {getName(layer)}
                            </div>

                            {/* Quick Actions on Hover */}
                            <div className={clsx("flex items-center gap-1", isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        moveLayer(layer.id, 'up');
                                    }}
                                    className="p-1 hover:bg-white/50 text-gray-500 rounded-lg transition-colors"
                                    title="Move Up"
                                >
                                    <ArrowUp size={12} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        moveLayer(layer.id, 'down');
                                    }}
                                    className="p-1 hover:bg-white/50 text-gray-500 rounded-lg transition-colors"
                                    title="Move Down"
                                >
                                    <ArrowDown size={12} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeLayer(layer.id);
                                    }}
                                    className="p-1 hover:bg-red-500/10 hover:text-red-600 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

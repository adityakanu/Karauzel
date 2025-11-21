
import Konva from 'konva';
import {
    ArrowDown,
    ArrowUp,
    BringToFront,
    Circle as CircleIcon,
    Download,
    Eye,
    Image as ImageIcon,
    Minus,
    Plus,
    SendToBack,
    Square,
    Trash2,
    Type
} from 'lucide-react';
import React, { useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { exportCanvas, generateSlides } from '../../utils/exportUtils';
import { InstagramPreview } from '../Preview/InstagramPreview';

export const Toolbar: React.FC = () => {
    const { addLayer, selectedIds, removeLayer, moveLayer, slideCount, setSlideCount, canvasHeight, setCanvasHeight, backgroundColor, setBackgroundColor, layers, updateLayer } = useCanvasStore();
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewSlides, setPreviewSlides] = useState<string[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.src = reader.result as string;
                img.onload = () => {
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

                    addLayer({
                        id: crypto.randomUUID(),
                        type: 'image',
                        x: 100,
                        y: 100,
                        width,
                        height,
                        content: reader.result as string,
                    });
                };
            };
            reader.readAsDataURL(file);
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleExport = () => {
        // We need access to the stage.
        // Since Toolbar is outside StageWrapper, we don't have direct access.
        // We can use Konva.stages[0] if there is only one stage.
        const stage = Konva.stages[0];
        if (stage) {
            exportCanvas(stage, slideCount);
        }
    };

    const handlePreview = async () => {
        const stage = Konva.stages[0];
        if (stage) {
            const slides = await generateSlides(stage, slideCount);
            setPreviewSlides(slides);
            setIsPreviewOpen(true);
        }
    };

    const handleAddText = () => {
        // Calculate center of current view
        // We need to know the stage size, but for now let's just use a rough estimate or 0,0 offset by position
        // Better: just put it in the middle of the first slide for now, or center of screen if we had access to stage size here.
        // Let's just put it at 100, 100 relative to current view.
        // Since we don't have stage ref here easily, let's just add at 100,100 absolute for MVP.
        // Users can drag it.

        // Actually, let's try to be smarter.
        // If we want it in the center of the viewport:
        // viewportX = -position.x / scale
        // viewportY = -position.y / scale
        // center = viewport + (width/2, height/2) / scale
        // We don't know width/height here easily without store update or hook.
        // Let's stick to a safe default.

        addLayer({
            id: crypto.randomUUID(),
            type: 'text',
            x: 100,
            y: 100,
            text: 'Double click to edit',
            fontSize: 24,
            fill: 'black',
            width: 200,
        });
    };

    const handleAddShape = (type: 'rect' | 'circle') => {
        addLayer({
            id: crypto.randomUUID(),
            type: 'shape',
            shapeType: type, // We need to handle this in StageWrapper
            x: 150,
            y: 150,
            width: 100,
            height: 100,
            fill: '#3b82f6', // blue-500
        });
    };

    const hasSelection = selectedIds.length > 0;

    return (
        <>
            {/* Tools Bar - Left Vertical */}
            <div className="fixed left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-1.5 flex flex-col gap-1 z-20">
                <button
                    onClick={handleUploadClick}
                    className="p-2 hover:bg-white/50 rounded-xl text-gray-700 transition-colors"
                    title="Upload Image"
                >
                    <ImageIcon size={20} />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                <button
                    onClick={handleAddText}
                    className="p-2 hover:bg-white/50 rounded-xl text-gray-700 transition-colors"
                    title="Add Text"
                >
                    <Type size={20} />
                </button>
                <button
                    onClick={() => handleAddShape('rect')}
                    className="p-2 hover:bg-white/50 rounded-xl text-gray-700 transition-colors"
                    title="Add Rectangle"
                >
                    <Square size={20} />
                </button>
                <button
                    onClick={() => handleAddShape('circle')}
                    className="p-2 hover:bg-white/50 rounded-xl text-gray-700 transition-colors"
                    title="Add Circle"
                >
                    <CircleIcon size={20} />
                </button>
            </div>

            {/* Canvas Bar - Bottom Center */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-lg rounded-full shadow-2xl border border-white/20 px-4 py-2 flex items-center gap-4 z-20">
                {/* Slide Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSlideCount(Math.max(1, slideCount - 1))}
                        className="p-1.5 hover:bg-white/50 rounded-full text-gray-500 transition-colors"
                        title="Remove Slide"
                    >
                        <Minus size={16} />
                    </button>
                    <span className="text-sm font-medium text-gray-700 min-w-[2ch] text-center">{slideCount}</span>
                    <button
                        onClick={() => setSlideCount(slideCount + 1)}
                        className="p-1.5 hover:bg-white/50 rounded-full text-gray-500 transition-colors"
                        title="Add Slide"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                <div className="w-px h-4 bg-gray-400/30" />

                {/* Height Toggle */}
                <button
                    onClick={() => setCanvasHeight(canvasHeight === 1080 ? 1350 : 1080)}
                    className="px-3 py-1 hover:bg-white/50 rounded-full text-gray-700 transition-colors text-xs font-medium border border-gray-400/30"
                    title="Toggle Height"
                >
                    {canvasHeight === 1080 ? '1:1' : '4:5'}
                </button>

                <div className="w-px h-4 bg-gray-400/30" />

                {/* Background Color */}
                <div className="relative group cursor-pointer">
                    <div className="w-6 h-6 rounded-full border border-gray-400/30 shadow-sm" style={{ backgroundColor }} />
                    <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        title="Background Color"
                    />
                </div>

                <div className="w-px h-4" />

                {/* Text Controls - Only visible when text is selected */}
                {hasSelection && layers.find(l => l.id === selectedIds[0])?.type === 'text' && (() => {
                    const layer = layers.find(l => l.id === selectedIds[0])!;
                    return (
                        <>
                            <select
                                value={layer.fontFamily || 'Inter'}
                                onChange={(e) => updateLayer(selectedIds[0], { fontFamily: e.target.value })}
                                className="text-base py-1 bg-white/50 hover:bg-white/70 transition-colors"
                            >
                                <option value="Inter">Inter</option>
                                <option value="Roboto">Roboto</option>
                                <option value="Playfair Display">Playfair Display</option>
                                <option value="Merriweather">Merriweather</option>
                                <option value="Montserrat">Montserrat</option>
                                <option value="Oswald">Oswald</option>
                            </select>

                            <input
                                type="number"
                                value={layer.fontSize || 24}
                                onChange={(e) => updateLayer(selectedIds[0], { fontSize: Number(e.target.value) })}
                                className="w-14 text-sm border border-gray-400/30 rounded px-2 py-1 bg-white/50 hover:bg-white/70 transition-colors"
                                title="Font Size"
                            />

                            <div className="flex items-center gap-0.5 bg-white/50 rounded p-0.5">
                                <button
                                    onClick={() => {
                                        const currentStyle = layer.fontStyle || 'normal';
                                        const isBold = currentStyle.includes('bold');
                                        let newStyle = currentStyle;
                                        if (isBold) {
                                            newStyle = newStyle.replace('bold', '').trim();
                                        } else {
                                            newStyle = `${newStyle} bold`.trim();
                                        }
                                        if (!newStyle) newStyle = 'normal';
                                        updateLayer(selectedIds[0], { fontStyle: newStyle });
                                    }}
                                    className={`px-2 py-1 rounded hover:bg-white transition-colors ${layer.fontStyle?.includes('bold') ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
                                    title="Bold"
                                >
                                    <span className="font-bold text-base">B</span>
                                </button>
                                <button
                                    onClick={() => {
                                        const currentStyle = layer.fontStyle || 'normal';
                                        const isItalic = currentStyle.includes('italic');
                                        let newStyle = currentStyle;
                                        if (isItalic) {
                                            newStyle = newStyle.replace('italic', '').trim();
                                        } else {
                                            newStyle = `${newStyle} italic`.trim();
                                        }
                                        if (!newStyle) newStyle = 'normal';
                                        updateLayer(selectedIds[0], { fontStyle: newStyle });
                                    }}
                                    className={`px-2 py-1 rounded hover:bg-white transition-colors ${layer.fontStyle?.includes('italic') ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
                                    title="Italic"
                                >
                                    <span className="italic text-base">I</span>
                                </button>
                                <button
                                    onClick={() => {
                                        const currentDeco = layer.textDecoration || '';
                                        const isUnderline = currentDeco.includes('underline');
                                        updateLayer(selectedIds[0], { textDecoration: isUnderline ? '' : 'underline' });
                                    }}
                                    className={`px-2 py-1 rounded hover:bg-white transition-colors ${layer.textDecoration === 'underline' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
                                    title="Underline"
                                >
                                    <span className="underline text-base">U</span>
                                </button>
                                <button
                                    onClick={() => {
                                        const currentDeco = layer.textDecoration || '';
                                        const isStrike = currentDeco.includes('line-through');
                                        updateLayer(selectedIds[0], { textDecoration: isStrike ? '' : 'line-through' });
                                    }}
                                    className={`px-2 py-1 rounded hover:bg-white transition-colors ${layer.textDecoration === 'line-through' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
                                    title="Strikethrough"
                                >
                                    <span className="line-through text-base">S</span>
                                </button>
                            </div>

                            <div className="w-px h-4 bg-gray-400/30" />
                        </>
                    );
                })()}

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={handlePreview}
                        className="p-2 hover:bg-white/50 text-purple-600 rounded-full transition-colors"
                        title="Preview"
                    >
                        <Eye size={20} />
                    </button>
                    <button
                        onClick={handleExport}
                        className="p-2 hover:bg-white/50 text-blue-600 rounded-full transition-colors"
                        title="Export"
                    >
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Context Menu / Floating Properties - Right of Selection or Fixed Right */}
            {hasSelection && (
                <div className="fixed right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-2 flex flex-col gap-2 z-20 animate-in fade-in slide-in-from-right-2">
                    <div className="flex flex-col gap-1 border-b border-gray-400/20 pb-2">
                        <button
                            onClick={() => moveLayer(selectedIds[0], 'top')}
                            className="p-2 hover:bg-white/50 rounded-xl text-gray-700 transition-colors"
                            title="Bring to Front"
                        >
                            <BringToFront size={20} />
                        </button>
                        <button
                            onClick={() => moveLayer(selectedIds[0], 'up')}
                            className="p-2 hover:bg-white/50 rounded-xl text-gray-700 transition-colors"
                            title="Bring Forward"
                        >
                            <ArrowUp size={20} />
                        </button>
                        <button
                            onClick={() => moveLayer(selectedIds[0], 'down')}
                            className="p-2 hover:bg-white/50 rounded-xl text-gray-700 transition-colors"
                            title="Send Backward"
                        >
                            <ArrowDown size={20} />
                        </button>
                        <button
                            onClick={() => moveLayer(selectedIds[0], 'bottom')}
                            className="p-2 hover:bg-white/50 rounded-xl text-gray-700 transition-colors"
                            title="Send to Back"
                        >
                            <SendToBack size={20} />
                        </button>
                    </div>

                    <button
                        onClick={() => removeLayer(selectedIds[0])}
                        className="p-2 hover:bg-red-500/10 text-red-600 rounded-xl transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={20} />
                    </button>

                    <PropertiesPanel selectedId={selectedIds[0]} />
                </div>
            )}

            <InstagramPreview
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                slides={previewSlides}
            />
        </>
    );
};

const PropertiesPanel = ({ selectedId }: { selectedId: string }) => {
    const { layers, updateLayer } = useCanvasStore();
    const layer = layers.find(l => l.id === selectedId);

    if (!layer) return null;

    return (
        <div className="border-t border-gray-400/20 pt-2 flex flex-col gap-2">
            {/* Common: Opacity? Rotation? For now just Fill/Color */}
            {(layer.type === 'shape' || layer.type === 'text') && (
                <div className="relative group cursor-pointer" title="Change Color">
                    <div
                        className="w-8 h-8 rounded-full border border-gray-400/30 shadow-sm"
                        style={{ backgroundColor: layer.fill || '#000000' }}
                    />
                    <input
                        type="color"
                        value={layer.fill || '#000000'}
                        onChange={(e) => updateLayer(selectedId, { fill: e.target.value })}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                </div>
            )}


        </div>
    );
}

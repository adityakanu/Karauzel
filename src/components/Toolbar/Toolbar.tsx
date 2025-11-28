import Konva from 'konva';
import {
    ArrowDown,
    ArrowUp,
    BringToFront,
    Circle as CircleIcon,
    Download,
    Eye,
    Image as ImageIcon,
    LayoutTemplate,
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
import { LAYOUT_TEMPLATES, applyLayout } from '../../utils/layoutEngine';
import { InstagramPreview } from '../Preview/InstagramPreview';
import { Tooltip } from '../ui/Tooltip';

export const Toolbar: React.FC = () => {
    const { addLayer, selectedIds, removeLayer, moveLayer, slideCount, setSlideCount, canvasHeight, setCanvasHeight, backgroundColor, setBackgroundColor, layers, updateLayer, addLayers } = useCanvasStore();
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewSlides, setPreviewSlides] = useState<string[]>([]);
    const [showLayouts, setShowLayouts] = useState(false);
    const [targetSlide, setTargetSlide] = useState(1);
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
            shapeType: type,
            x: 150,
            y: 150,
            width: 100,
            height: 100,
            fill: '#3b82f6', // blue-500
        });
    };

    const handleApplyLayout = (templateId: string) => {
        // targetSlide is 1-based, applyLayout expects 0-based index
        const newLayers = applyLayout(templateId, targetSlide - 1, 1080, canvasHeight);
        addLayers(newLayers);
        setShowLayouts(false);
    };

    const hasSelection = selectedIds.length > 0;

    return (
        <>
            {/* Tools Bar - Left Vertical */}
            <div className="fixed left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-1.5 flex flex-col gap-1 z-20">
                <Tooltip content="Upload Image" position="right">
                    <button
                        onClick={handleUploadClick}
                        className="p-2 hover:bg-white/50 rounded-xl text-gray-700 transition-colors"
                    >
                        <ImageIcon size={20} />
                    </button>
                </Tooltip>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                <Tooltip content="Add Text" position="right">
                    <button
                        onClick={handleAddText}
                        className="p-2 hover:bg-white/50 rounded-xl text-gray-700 transition-colors"
                    >
                        <Type size={20} />
                    </button>
                </Tooltip>
                <Tooltip content="Add Rectangle" position="right">
                    <button
                        onClick={() => handleAddShape('rect')}
                        className="p-2 hover:bg-white/50 rounded-xl text-gray-700 transition-colors"
                    >
                        <Square size={20} />
                    </button>
                </Tooltip>
                <Tooltip content="Add Circle" position="right">
                    <button
                        onClick={() => handleAddShape('circle')}
                        className="p-2 hover:bg-white/50 rounded-xl text-gray-700 transition-colors"
                    >
                        <CircleIcon size={20} />
                    </button>
                </Tooltip>

                <div className="w-full h-px bg-white/30 my-1" />

                <Tooltip content="Layouts" position="right">
                    <button
                        onClick={() => setShowLayouts(!showLayouts)}
                        className={`p-2 hover:bg-white/50 rounded-xl text-gray-700 transition-colors ${showLayouts ? 'bg-white/50 text-blue-600' : ''}`}
                    >
                        <LayoutTemplate size={20} />
                    </button>
                </Tooltip>
            </div>

            {/* Layouts Panel */}
            {showLayouts && (
                <div className="fixed left-20 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 w-64 z-20 max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700">Layouts</h3>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Slide:</span>
                            <select
                                value={targetSlide}
                                onChange={(e) => setTargetSlide(Number(e.target.value))}
                                className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white"
                            >
                                {Array.from({ length: slideCount }, (_, i) => i + 1).map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {LAYOUT_TEMPLATES.map(template => (
                            <button
                                key={template.id}
                                onClick={() => handleApplyLayout(template.id)}
                                className="aspect-square bg-gray-100 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all flex flex-col items-center justify-center gap-1 p-2"
                            >
                                <div className="w-full h-full bg-white rounded border border-gray-200 relative overflow-hidden opacity-60">
                                    {/* Mini preview of layout items */}
                                    {template.items.map((item, i) => (
                                        <div
                                            key={i}
                                            className="absolute bg-gray-400"
                                            style={{
                                                left: `${(item.x / 1080) * 100}%`,
                                                top: `${(item.y / 1080) * 100}%`,
                                                width: `${(item.width / 1080) * 100}%`,
                                                height: `${(item.height / 1080) * 100}%`,
                                            }}
                                        />
                                    ))}
                                </div>
                                <span className="text-[10px] text-gray-600 font-medium truncate w-full text-center">{template.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Canvas Bar - Bottom Center */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-lg rounded-full shadow-2xl border border-white/20 px-4 py-2 flex items-center gap-4 z-20">
                {/* Slide Controls */}
                <div className="flex items-center gap-2">
                    <Tooltip content="Remove Slide" position="top">
                        <button
                            onClick={() => setSlideCount(Math.max(1, slideCount - 1))}
                            className="p-1.5 hover:bg-white/50 rounded-full text-gray-500 transition-colors"
                        >
                            <Minus size={16} />
                        </button>
                    </Tooltip>
                    <span className="text-sm font-medium text-gray-700 min-w-[2ch] text-center">{slideCount}</span>
                    <Tooltip content="Add Slide" position="top">
                        <button
                            onClick={() => setSlideCount(slideCount + 1)}
                            className="p-1.5 hover:bg-white/50 rounded-full text-gray-500 transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </Tooltip>
                </div>

                <div className="w-px h-4 bg-gray-400/30" />

                {/* Height Toggle */}
                <Tooltip content="Toggle Height" position="top">
                    <button
                        onClick={() => setCanvasHeight(canvasHeight === 1080 ? 1350 : 1080)}
                        className="px-3 py-1 hover:bg-white/50 rounded-full text-gray-700 transition-colors text-xs font-medium border border-gray-400/30"
                    >
                        {canvasHeight === 1080 ? '1:1' : '4:5'}
                    </button>
                </Tooltip>

                <div className="w-px h-4 bg-gray-400/30" />

                {/* Background Color */}
                <Tooltip content="Background Color" position="top">
                    <div className="relative group cursor-pointer">
                        <div className="w-6 h-6 rounded-full border border-gray-400/30 shadow-sm" style={{ backgroundColor }} />
                        <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                    </div>
                </Tooltip>

                <div className="w-px h-4" />

                {/* Frame Style Controls - Only visible when image is selected */}
                {hasSelection && layers.find(l => l.id === selectedIds[0])?.type === 'image' && (() => {
                    const layer = layers.find(l => l.id === selectedIds[0])!;
                    return (
                        <>
                            <div className="flex items-center gap-1 bg-white/50 rounded-lg p-1">
                                {['default', 'polaroid', 'vintage'].map(variant => (
                                    <button
                                        key={variant}
                                        onClick={() => updateLayer(selectedIds[0], { variant: variant as any })}
                                        className={`px-2 py-1 text-md rounded-md transition-all capitalize ${(layer.variant || 'default') === variant
                                            ? 'bg-white shadow-sm text-blue-600 font-medium'
                                            : 'text-gray-600 hover:bg-white/50'
                                            }`}
                                    >
                                        {variant}
                                    </button>
                                ))}
                            </div>
                            <div className="w-px h-4 bg-gray-400/30" />
                        </>
                    );
                })()}

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
                                <option value="Hina Mincho">Hina Mincho</option>
                            </select>

                            <Tooltip content="Font Size" position="top">
                                <input
                                    type="number"
                                    value={layer.fontSize || 24}
                                    onChange={(e) => updateLayer(selectedIds[0], { fontSize: Number(e.target.value) })}
                                    className="w-14 text-sm border border-gray-400/30 rounded px-2 py-1 bg-white/50 hover:bg-white/70 transition-colors"
                                />
                            </Tooltip>

                            <div className="flex items-center gap-0.5 bg-white/50 rounded p-0.5">
                                <Tooltip content="Bold" position="top">
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
                                    >
                                        <span className="font-bold text-base">B</span>
                                    </button>
                                </Tooltip>
                                <Tooltip content="Italic" position="top">
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
                                    >
                                        <span className="italic text-base">I</span>
                                    </button>
                                </Tooltip>
                                <Tooltip content="Underline" position="top">
                                    <button
                                        onClick={() => {
                                            const currentDeco = layer.textDecoration || '';
                                            const isUnderline = currentDeco.includes('underline');
                                            updateLayer(selectedIds[0], { textDecoration: isUnderline ? '' : 'underline' });
                                        }}
                                        className={`px-2 py-1 rounded hover:bg-white transition-colors ${layer.textDecoration === 'underline' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
                                    >
                                        <span className="underline text-base">U</span>
                                    </button>
                                </Tooltip>
                                <Tooltip content="Strikethrough" position="top">
                                    <button
                                        onClick={() => {
                                            const currentDeco = layer.textDecoration || '';
                                            const isStrike = currentDeco.includes('line-through');
                                            updateLayer(selectedIds[0], { textDecoration: isStrike ? '' : 'line-through' });
                                        }}
                                        className={`px-2 py-1 rounded hover:bg-white transition-colors ${layer.textDecoration === 'line-through' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
                                    >
                                        <span className="line-through text-base">S</span>
                                    </button>
                                </Tooltip>
                            </div>

                            <div className="w-px h-4 bg-gray-400/30" />
                        </>
                    );
                })()}

                {/* Actions */}
                <div className="flex items-center gap-1">
                    <Tooltip content="Preview" position="top">
                        <button
                            onClick={handlePreview}
                            className="p-2 hover:bg-white/50 text-purple-600 rounded-full transition-colors"
                        >
                            <Eye size={20} />
                        </button>
                    </Tooltip>
                    <Tooltip content="Export" position="top">
                        <button
                            onClick={handleExport}
                            className="p-2 hover:bg-white/50 text-blue-600 rounded-full transition-colors"
                        >
                            <Download size={20} />
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* Context Menu / Floating Properties */}
            {hasSelection && (
                <div className="fixed right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-2 flex flex-col gap-2 z-20 animate-in fade-in slide-in-from-right-2">
                    {/* Layer Ordering */}
                    <div className="flex flex-col gap-1 border-b border-gray-400/20 pb-2">
                        <Tooltip content="Bring to Front" position="left">
                            <button
                                onClick={() => moveLayer(selectedIds[0], 'top')}
                                className="p-2 hover:bg-white/50 rounded-xl text-gray-700 transition-colors"
                            >
                                <BringToFront size={20} />
                            </button>
                        </Tooltip>
                        <Tooltip content="Bring Forward" position="left">
                            <button
                                onClick={() => moveLayer(selectedIds[0], 'up')}
                                className="p-2 hover:bg-white/50 rounded-xl text-gray-700 transition-colors"
                            >
                                <ArrowUp size={20} />
                            </button>
                        </Tooltip>
                        <Tooltip content="Send Backward" position="left">
                            <button
                                onClick={() => moveLayer(selectedIds[0], 'down')}
                                className="p-2 hover:bg-white/50 rounded-xl text-gray-700 transition-colors"
                            >
                                <ArrowDown size={20} />
                            </button>
                        </Tooltip>
                        <Tooltip content="Send to Back" position="left">
                            <button
                                onClick={() => moveLayer(selectedIds[0], 'bottom')}
                                className="p-2 hover:bg-white/50 rounded-xl text-gray-700 transition-colors"
                            >
                                <SendToBack size={20} />
                            </button>
                        </Tooltip>
                    </div>

                    {/* Delete */}
                    <Tooltip content="Delete" position="left">
                        <button
                            onClick={() => removeLayer(selectedIds[0])}
                            className="p-2 hover:bg-red-500/10 text-red-600 rounded-xl transition-colors"
                        >
                            <Trash2 size={20} />
                        </button>
                    </Tooltip>

                    {/* Properties Panel Content */}
                    <div className="pt-2 border-t border-gray-400/20">
                        <PropertiesPanel selectedId={selectedIds[0]} />
                    </div>
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
        <div className="flex flex-col gap-4 w-full">


            {/* Common: Color Picker */}
            {(layer.type === 'shape' || layer.type === 'text') && (
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-600">Color</label>
                    <div className="relative group cursor-pointer">
                        <div
                            className="w-full h-8 rounded-lg border border-gray-400/30 shadow-sm"
                            style={{ backgroundColor: layer.fill || '#000000' }}
                        />
                        <input
                            type="color"
                            value={layer.fill || '#000000'}
                            onChange={(e) => updateLayer(selectedId, { fill: e.target.value })}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

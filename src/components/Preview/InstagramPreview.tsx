import { X } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';

interface InstagramPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    slides: string[];
}

export const InstagramPreview: React.FC<InstagramPreviewProps> = ({ isOpen, onClose, slides }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl w-full max-w-md h-[80vh] flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Preview</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Mock Instagram Feed */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="bg-white mb-4">
                        {/* Header Mock */}
                        <div className="flex items-center p-3 gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                                <div className="w-full h-full rounded-full bg-white border-2 border-white" />
                            </div>
                            <div className="text-sm font-semibold">your_username</div>
                        </div>

                        {/* Carousel */}
                        <div className="aspect-square w-full bg-gray-200 overflow-x-auto flex snap-x snap-mandatory scrollbar-hide">
                            {slides.map((slide, i) => (
                                <img
                                    key={i}
                                    src={slide}
                                    alt={`Slide ${i + 1}`}
                                    className="w-full h-full object-cover flex-shrink-0 snap-center"
                                />
                            ))}
                        </div>

                        {/* Actions Mock */}
                        <div className="p-3">
                            <div className="flex gap-4 mb-2">
                                <div className="w-6 h-6 rounded-full border-2 border-black" />
                                <div className="w-6 h-6 rounded-full border-2 border-black" />
                                <div className="w-6 h-6 rounded-full border-2 border-black ml-auto" />
                            </div>
                            <div className="text-sm font-semibold mb-1">1,234 likes</div>
                            <div className="text-sm"><span className="font-semibold">your_username</span> Just created this awesome carousel with Colla.design! #design #carousel</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

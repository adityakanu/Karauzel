import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top',
    delay = 0.3,
    className = ''
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const getPositionStyles = () => {
        switch (position) {
            case 'top':
                return { bottom: '100%', left: '50%', x: '-50%', mb: 2 };
            case 'bottom':
                return { top: '100%', left: '50%', x: '-50%', mt: 2 };
            case 'left':
                return { right: '100%', top: '50%', y: '-50%', mr: 2 };
            case 'right':
                return { left: '100%', top: '50%', y: '-50%', ml: 2 };
            default:
                return { bottom: '100%', left: '50%', x: '-50%', mb: 2 };
        }
    };

    const positionStyles = getPositionStyles();

    // Adjust margin based on position for the motion div
    const marginProp = position === 'top' ? { marginBottom: 8 } :
        position === 'bottom' ? { marginTop: 8 } :
            position === 'left' ? { marginRight: 8 } :
                { marginLeft: 8 };

    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15, delay }}
                        style={{
                            position: 'absolute',
                            ...positionStyles,
                            ...marginProp,
                            pointerEvents: 'none',
                            zIndex: 50,
                            whiteSpace: 'nowrap'
                        }}
                        className="px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg backdrop-blur-sm bg-opacity-90"
                    >
                        {content}
                        {/* Arrow */}
                        <div
                            className={`absolute w-2 h-2 bg-gray-800 transform rotate-45 ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
                                    position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
                                        position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
                                            'left-[-4px] top-1/2 -translate-y-1/2'
                                }`}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

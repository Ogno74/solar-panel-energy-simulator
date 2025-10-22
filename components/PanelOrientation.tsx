
import React from 'react';

interface PanelOrientationProps {
    angle: number;
    panelLabel: 'a' | 'b';
}

export const PanelOrientation: React.FC<PanelOrientationProps> = ({ angle, panelLabel }) => {
    // Panel 'a' (left) pivots on the right and rotates up/left (positive angle in SVG)
    // Panel 'b' (right) pivots on the left and rotates up/right (negative angle in SVG)
    const rotation = panelLabel === 'a' ? angle : -angle;
    const pivotX = panelLabel === 'a' ? 85 : 15;
    const transform = `rotate(${rotation}, ${pivotX}, 50)`;

    return (
        <div className="w-full h-24 bg-gray-50 border border-gray-200 rounded-md p-2 mt-2">
            <svg viewBox="0 0 100 65" className="w-full h-full">
                {/* Horizon */}
                <line x1="0" y1="50" x2="100" y2="50" stroke="#9ca3af" strokeWidth="1.5" />
                
                {/* Panel */}
                <line 
                    x1={panelLabel === 'a' ? pivotX - 60 : pivotX} 
                    y1="50" 
                    x2={panelLabel === 'a' ? pivotX : pivotX + 60} 
                    y2="50" 
                    stroke="#3b82f6" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    transform={transform}
                />

                {/* Pivot point */}
                <circle cx={pivotX} cy="50" r="3" fill="#1e40af" />
            </svg>
        </div>
    );
};

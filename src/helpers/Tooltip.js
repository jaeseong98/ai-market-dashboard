import React, { useState } from 'react';

export const Tooltip = ({ content, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative inline-block"
             onMouseEnter={() => setIsVisible(true)}
             onMouseLeave={() => setIsVisible(false)}>
            {children}
            {isVisible && (
                <div className="absolute z-10 p-2 bg-gray-700 text-white rounded shadow-lg mt-2">
                    {content}
                </div>
            )}
        </div>
    );
};

export const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    }).format(value);
};
import React from 'react';
import { formatNumber } from '../helpers/Tooltip.js'; // formatNumber 함수를 가져옵니다.

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const hasActualData = payload.some((item) => !item.name.includes('예측'));
        const filteredPayload = hasActualData ? payload.filter((item) => !item.name.includes('예측')) : payload;

        return (
            <div
                className="custom-tooltip"
                style={{ backgroundColor: '#2D3748', padding: '10px', borderRadius: '4px' }}
            >
                <p className="label" style={{ color: '#FFF' }}>
                    {label}
                </p>
                {filteredPayload.map((item, index) => (
                    <p key={index} className="intro" style={{ color: item.color }}>
                        {item.name}: {formatNumber(item.value)} {/* 천 단위 구분자 적용 */}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default CustomTooltip;

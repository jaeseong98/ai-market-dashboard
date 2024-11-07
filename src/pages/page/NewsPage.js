import React from 'react';
import DomesticBondAnalysis from '../dashboard/components/DomesticBondAnalysis.js';
import GlobalBondAnalysis from '../dashboard/components/GlobalBondAnalysis.js';


const BondMarketAnalysis = () => {
    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-100">
                채권 시장 분석
            </h2>
            <div className="flex gap-4 w-full">
                <DomesticBondAnalysis />
                <GlobalBondAnalysis />
            </div>
        </div>
    );
};

export default BondMarketAnalysis;
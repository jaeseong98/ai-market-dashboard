import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

import EconomicTrends from './components/EconomicTrends.js';
import DomesticBondAnalysis from './components/domestic/DomesticBondAnalysis.js';
import DomesticEquityAnalysis from './components/domestic/DomesticEquityAnalysis.js';
import GlobalEquityAnalysis from './components/global/GlobalEquityAnalysis.js';
import GlobalBondAnalysis from './components/global/GlobalBondAnalysis.js';

const TrendPage = () => {
    const [searchParams] = useSearchParams();
    const market = searchParams.get('market') || 'global';

    return (
        <div className="space-y-8">
            {/* 경제 동향 섹션 */}
            <section>
                <h2 className="text-lg font-semibold text-gray-100 mb-3">경제 동향(임시 텍스트)</h2>
                <EconomicTrends />
            </section>

            {/* 시장 분석 섹션 */}
            <section>
                <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-lg font-semibold text-gray-100">시장 분석(임시 텍스트)</h2>
                    
                    <div className="flex items-center gap-3">
                        <span className={`text-sm ${market === 'domestic' ? 'text-blue-400' : 'text-gray-400'}`}>
                            국내
                        </span>
                        <Link 
                            to={`/trend?market=${market === 'global' ? 'domestic' : 'global'}`}
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-700 cursor-pointer transition-colors"
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                                    market === 'global' ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </Link>
                        <span className={`text-sm ${market === 'global' ? 'text-blue-400' : 'text-gray-400'}`}>
                            해외
                        </span>
                    </div>
                </div>

                {/* 시장 영향 요인 */}
                <div className="mb-6 text-sm text-gray-200">
                    <div className="flex gap-2 mb-1">
                        <span className="text-white">□</span>
                        <span className="text-green-400">(긍정적)</span>
                        {market === 'global' ? (
                            <span>미국 기준금리 인하 및 추가 인하 기대감, 중국의 2조 위안 규모 경기 부양책 발표</span>
                        ) : (
                            <span>수출 회복세 지속, 물가상승률 안정화, 무역수지 흑자 기조 유지</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <span className="text-white">□</span>
                        <span className="text-red-400">(부정적)</span>
                        {market === 'global' ? (
                            <span>미국 경제의 경기 사이클 후반부 진입, 중국-미국 간 무역 갈등, 중동 지정학적 리스크</span>
                        ) : (
                            <span>GDP 성장률 둔화, 민간소비 및 건설투자 부진, 대외 불확실성 지속</span>
                        )}
                    </div>
                </div>

                {market === 'global' ? (
                    <div className="grid grid-cols-2 gap-5">
                        <GlobalEquityAnalysis />
                        <GlobalBondAnalysis />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-5">
                        <DomesticEquityAnalysis />
                        <DomesticBondAnalysis />
                    </div>
                )}
            </section>
        </div>
    );
};

export default TrendPage;
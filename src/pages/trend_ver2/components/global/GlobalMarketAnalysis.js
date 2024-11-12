import { Card, CardContent } from '../../../../components/Card.js';
import { useState, useCallback } from 'react';
import marketTrends from '../../../../data/marketTrends.json';  
import marketData from '../../../../data/marketData.json'; 

const PERIODS = [
    { id: 'daily', label: '전일대비' },
    { id: 'weekly', label: '전주대비' },
    { id: 'monthly', label: '전월대비' },
    { id: 'quarterly', label: '전분기대비' },
    { id: 'yearly', label: '전년대비' }
];

const TREND_PERIODS = [
    { id: 'daily', label: '일간 동향' },
    { id: 'weekly', label: '주간 동향' },
    { id: 'monthly', label: '월간 동향' }
];

const GlobalMarketAnalysis = () => {
    const [selectedEquityTrendPeriod, setSelectedEquityTrendPeriod] = useState('daily');
    const [selectedBondsTrendPeriod, setSelectedBondsTrendPeriod] = useState('daily');

    // 주식과 채권 각각의 증감을 위한 state만 추가
    const [selectedEquityPeriod, setSelectedEquityPeriod] = useState('daily');
    const [selectedBondsPeriod, setSelectedBondsPeriod] = useState('daily');

    // getIndexByPeriod 함수 수정
    const getIndexByPeriod = useCallback((period) => {
        switch(period) {
            case 'daily':
                return 1;
            case 'weekly':
                return 5;
            case 'monthly':
                return 20;
            case 'quarterly':
                return 60;
            case 'yearly':
                return 252;  // 1년치 데이터 비교
            default:
                return 1;
        }
    }, []);

    const formatChange = useCallback((current, previous, type = 'bp') => {
        if (current === undefined || previous === undefined) {
            return 'N/A';
        }

        const change = current - previous;
        
        if (type === 'bp') {
            // 베이시스 포인트로 변환 (0.01 = 1bp)
            const bpChange = change * 10000;
            const absBpChange = Math.abs(bpChange);
            if (change === 0) {
                return `${(current * 100).toFixed(2)}%(유지)`;
            }
            return `${absBpChange.toFixed(1)}bp${change > 0 ? '↑' : '↓'}`;
        } else {
            // 퍼센트로 변환
            const percentChange = change * 100;
            if (change === 0) {
                return `${(current * 100).toFixed(2)}%(유지)`;
            }
            return `(${change > 0 ? '+' : ''}${percentChange.toFixed(2)}%)`;
        }
    }, []);

    // 통합된 분석 텍스트 생성 함수
    const getAnalysisText = useCallback((period, market) => {
        // 데이터 유효성 검사 수정
        if (!marketData || !marketData.global) {
            return '데이터 로딩 중...';
        }

        const index = getIndexByPeriod(period);
        const periodLabel = period === 'daily' ? '전일 대비' 
                         : period === 'weekly' ? '전주 대비' 
                         : period === 'monthly' ? '전월 대비'
                         : period === 'quarterly' ? '전분기 대비'
                         : '전년 대비';

        if (market === 'equity') {
            return `[${periodLabel} 증감]
● MSCI ACWI ${formatChange(marketData.global.equity.msci_acwi[marketData.dates.length - 1], marketData.global.equity.msci_acwi[marketData.dates.length - 1 - index])}, MSCI DM ${formatChange(marketData.global.equity.msci_dm[marketData.dates.length - 1], marketData.global.equity.msci_dm[marketData.dates.length - 1 - index])}, MSCI EM ${formatChange(marketData.global.equity.msci_em[marketData.dates.length - 1], marketData.global.equity.msci_em[marketData.dates.length - 1 - index])}
● NASDAQ ${formatChange(marketData.global.equity.nasdaq[marketData.dates.length - 1], marketData.global.equity.nasdaq[marketData.dates.length - 1 - index])}, S&P500 ${formatChange(marketData.global.equity.sp500[marketData.dates.length - 1], marketData.global.equity.sp500[marketData.dates.length - 1 - index])}, STOXX600 ${formatChange(marketData.global.equity.stoxx600[marketData.dates.length - 1], marketData.global.equity.stoxx600[marketData.dates.length - 1 - index])}`;
        } else {
            return `[${periodLabel} 증감]
● 미국 10년물 ${formatChange(marketData.global.bonds.us.y10[marketData.dates.length - 1], marketData.global.bonds.us.y10[marketData.dates.length - 1 - index])}, 독일 10년물 ${formatChange(marketData.global.bonds.us.y10[marketData.dates.length - 1], marketData.global.bonds.us.y10[marketData.dates.length - 1 - index])}, 영국 10년물 ${formatChange(marketData.global.bonds.us.y10[marketData.dates.length - 1], marketData.global.bonds.us.y10[marketData.dates.length - 1 - index])}`;
        }
    }, [getIndexByPeriod, formatChange]);

    // 금융시장 동향 텍스트 생성 함수
    const getTrendText = useCallback((period, market, type) => {
        if (!marketTrends.global[period]?.[market]) return '';
        
        switch(type) {
            case 'trend':
                return marketTrends.global[period][market].summary;
            case 'positiveNews':
                return marketTrends.global[period][market].good_news;
            case 'negativeNews':
                return marketTrends.global[period][market].bad_news;
            default:
                return '';
        }
    }, []);

    const getDateRange = useCallback((period) => {
        if (!marketData || !marketData.dates) return { start: '', end: '' };

        const dates = marketData.dates;
        const currentDate = new Date(dates[0]);  // 가장 최신 날짜

        // 기간에 따른 과거 날짜 계산
        let pastDate = new Date(currentDate);
        switch(period) {
            case 'daily':
                pastDate.setDate(currentDate.getDate() - 1);
                break;
            case 'weekly':
                pastDate.setDate(currentDate.getDate() - 7);
                break;
            case 'monthly':
                pastDate.setMonth(currentDate.getMonth() - 1);
                break;
            case 'quarterly':
                pastDate.setMonth(currentDate.getMonth() - 3);
                break;
            case 'yearly':
                pastDate.setFullYear(currentDate.getFullYear() - 1);
                break;
            default:
                pastDate.setDate(currentDate.getDate() - 1);
        }

        // YYYY-MM-DD 형식을 YY.MM.DD 형식으로 변환
        const formatDate = (date) => {
            const year = date.getFullYear().toString().slice(2);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}.${month}.${day}`;
        };

        return {
            start: formatDate(pastDate),
            end: formatDate(currentDate)
        };
    }, []);

    return (
        <Card className="bg-gray-900/50">
            <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-white">🌎</span>
                    <h3 className="text-lg font-medium text-white">해외 주식시장 및 채권시장</h3>
                </div>

                {/* 주식 섹션 */}
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="flex items-center text-yellow-300">
                            <span className="w-2 h-2 bg-yellow-300 rounded-full mr-2"></span>
                            해외 주식시장 동향 및 뉴스
                        </h4>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400">
                                ({getDateRange(selectedEquityTrendPeriod).start} ~ {getDateRange(selectedEquityTrendPeriod).end})
                            </span>
                            <select
                                value={selectedEquityTrendPeriod}
                                onChange={(e) => setSelectedEquityTrendPeriod(e.target.value)}
                                className="bg-gray-700 text-white text-sm px-3 py-1.5 rounded-md border border-gray-600"
                            >
                                {TREND_PERIODS.map(period => (
                                    <option key={period.id} value={period.id}>{period.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 주식시장 동향 */}
                    <div className="mb-4">
                        <p className="text-gray-200 text-sm">
                            {getTrendText(selectedEquityTrendPeriod, 'equity', 'trend')}
                        </p>
                    </div>

                    {/* 주식시장 뉴스 */}
                    <div className="mb-8 space-y-2">
                        <div className="text-gray-200 text-sm">
                            {getTrendText(selectedEquityTrendPeriod, 'equity', 'positiveNews')}
                        </div>
                        <div className="text-gray-200 text-sm">
                            {getTrendText(selectedEquityTrendPeriod, 'equity', 'negativeNews')}
                        </div>
                    </div>

                    {/* 주식 증감 */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="flex items-center text-yellow-300">
                                <span className="w-2 h-2 bg-yellow-300 rounded-full mr-2"></span>
                                해외 주식 증감
                            </h4>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-400">
                                    ({getDateRange(selectedEquityPeriod).start} ~ {getDateRange(selectedEquityPeriod).end})
                                </span>
                                <select
                                    value={selectedEquityPeriod}
                                    onChange={(e) => setSelectedEquityPeriod(e.target.value)}
                                    className="bg-gray-700 text-white text-sm px-3 py-1.5 rounded-md border border-gray-600"
                                >
                                    {PERIODS.map(period => (
                                        <option key={period.id} value={period.id}>{period.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <p className="text-gray-200 text-sm whitespace-pre-line">
                            {getAnalysisText(selectedEquityPeriod, 'equity')}
                        </p>
                    </div>
                </section>

                {/* 채권 섹션 */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="flex items-center text-blue-300">
                            <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                            해외 채권시장 동향 및 뉴스
                        </h4>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400">
                                ({getDateRange(selectedBondsTrendPeriod).start} ~ {getDateRange(selectedBondsTrendPeriod).end})
                            </span>
                            <select
                                value={selectedBondsTrendPeriod}
                                onChange={(e) => setSelectedBondsTrendPeriod(e.target.value)}
                                className="bg-gray-700 text-white text-sm px-3 py-1.5 rounded-md border border-gray-600"
                            >
                                {TREND_PERIODS.map(period => (
                                    <option key={period.id} value={period.id}>{period.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 채권시장 동향 */}
                    <div className="mb-4">
                        <p className="text-gray-200 text-sm">
                            {getTrendText(selectedBondsTrendPeriod, 'bonds', 'trend')}
                        </p>
                    </div>

                    {/* 채권시장 뉴스 */}
                    <div className="mb-8 space-y-2">
                        <div className="text-gray-200 text-sm">
                            {getTrendText(selectedBondsTrendPeriod, 'bonds', 'positiveNews')}
                        </div>
                        <div className="text-gray-200 text-sm">
                            {getTrendText(selectedBondsTrendPeriod, 'bonds', 'negativeNews')}
                        </div>
                    </div>

                    {/* 채권 증감 */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="flex items-center text-blue-300">
                                <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                                해외 채권 증감
                            </h4>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-400">
                                    ({getDateRange(selectedBondsPeriod).start} ~ {getDateRange(selectedBondsPeriod).end})
                                </span>
                                <select
                                    value={selectedBondsPeriod}
                                    onChange={(e) => setSelectedBondsPeriod(e.target.value)}
                                    className="bg-gray-700 text-white text-sm px-3 py-1.5 rounded-md border border-gray-600"
                                >
                                    {PERIODS.map(period => (
                                        <option key={period.id} value={period.id}>{period.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <p className="text-gray-200 text-sm whitespace-pre-line">
                            {getAnalysisText(selectedBondsPeriod, 'bonds')}
                        </p>
                    </div>
                </section>
            </CardContent>
        </Card>
    );
};

export default GlobalMarketAnalysis; 
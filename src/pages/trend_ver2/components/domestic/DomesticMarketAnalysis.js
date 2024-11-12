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

const DomesticMarketAnalysis = () => {
    const [selectedEquityTrendPeriod, setSelectedEquityTrendPeriod] = useState('daily');
    const [selectedBondsTrendPeriod, setSelectedBondsTrendPeriod] = useState('daily');
    const [selectedEquityPeriod, setSelectedEquityPeriod] = useState('daily');
    const [selectedBondsPeriod, setSelectedBondsPeriod] = useState('daily');

    // 기간별 인덱스 반환 함수
    const getIndexByPeriod = useCallback((period) => {
        switch(period) {
            case 'daily':
                return 1;
            case 'weekly':
                return 5;
            case 'monthly':
                return 21;
            case 'quarterly':
                return 63;
            case 'yearly':
                return 252;
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
            const bpChange = change * 100;
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

    // 날짜 포맷팅
    const formatDate = useCallback((dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear().toString().slice(2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    }, []);

    // 날짜 범위 계산
    const getDateRange = useCallback((period) => {
        if (!marketData || !marketData.dates) return { start: '', end: '' };

        const currentDate = new Date(marketData.dates[0]);
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

        return {
            start: formatDate(pastDate),
            end: formatDate(currentDate)
        };
    }, [formatDate]);

    // getTrendText 함수 수정
    const getTrendText = useCallback((period, market, type) => {
        if (!marketTrends.domestic[period]?.[market]) return '';
        
        switch(type) {
            case 'trend':
                return marketTrends.domestic[period][market].summary;
            case 'positiveNews':
                return marketTrends.domestic[period][market].good_news;
            case 'negativeNews':
                return marketTrends.domestic[period][market].bad_news;
            default:
                return '';
        }
    }, []);

    // getAnalysisText 함수는 기존 로직 유지 (실시간 데이터 계산)
    const getAnalysisText = useCallback((period, market) => {
        if (!marketData || !marketData.dates) return '';

        const index = getIndexByPeriod(period);
        const periodLabel = period === 'daily' ? '전일 대비' 
                         : period === 'weekly' ? '전주 대비' 
                         : period === 'monthly' ? '전월 대비'
                         : period === 'quarterly' ? '전분기 대비'
                         : '전년 대비';

        if (market === 'equity') {
            return `[${periodLabel} 증감]
● KOSPI ${formatChange(marketData.domestic.equity.kospi[marketData.dates.length - 1], marketData.domestic.equity.kospi[marketData.dates.length - 1 - index])}, KOSDAQ ${formatChange(marketData.domestic.equity.kosdaq[marketData.dates.length - 1], marketData.domestic.equity.kosdaq[marketData.dates.length - 1 - index])}, KOSPI200 ${formatChange(marketData.domestic.equity.kospi200[marketData.dates.length - 1], marketData.domestic.equity.kospi200[marketData.dates.length - 1 - index])}`;
        } else {
            return `[${periodLabel} 증감]
● 국고 3년물 ${formatChange(marketData.domestic.bonds.treasury.y3[marketData.dates.length - 1], marketData.domestic.bonds.treasury.y3[marketData.dates.length - 1 - index])}, 국고 10년물 ${formatChange(marketData.domestic.bonds.treasury.y10[marketData.dates.length - 1], marketData.domestic.bonds.treasury.y10[marketData.dates.length - 1 - index])}, CD ${formatChange(marketData.domestic.bonds.cd[marketData.dates.length - 1], marketData.domestic.bonds.cd[marketData.dates.length - 1 - index])}`;
        }
    }, [getIndexByPeriod, formatChange]);

    return (
        <Card className="bg-gray-900/50">
        <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
            <span className="text-white">📈</span>
            <h3 className="text-lg font-medium text-white">국내 주식시장 및 채권시장</h3>
            </div>
                {/* 주식 섹션 */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="flex items-center text-yellow-300">
                            <span className="w-2 h-2 bg-yellow-300 rounded-full mr-2"></span>
                            국내 주식시장 동향 및 뉴스
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
                                국내 주식 증감
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
                    
                    <div className="flex items-center justify-between mt-8 mb-4">
                        <h4 className="flex items-center text-blue-300">
                            <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                            국내 채권시장 동향 및 뉴스
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
                                국내 채권 증감
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

export default DomesticMarketAnalysis; 
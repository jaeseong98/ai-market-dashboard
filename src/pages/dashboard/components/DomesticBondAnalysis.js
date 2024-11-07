import { Card, CardContent } from '../../../components/Card.js'
import { useState, useMemo, useCallback, useEffect } from 'react'

const PERIODS = [
    { id: 'daily', label: '전일대비' },
    { id: 'weekly', label: '전주대비' },
    { id: 'monthly', label: '전월대비' },
    { id: 'quarterly', label: '전분기대비' },
    { id: 'yearly', label: '전년대비' }
];

const DomesticBondAnalysis = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('daily');
    const [comparisonText, setComparisonText] = useState('');

    // bondData를 먼저 정의
    const bondData = useMemo(() => {
        const baseData = {
            dates: ['2024-09-25', '2024-09-26', '2024-09-27', '2024-09-28', '2024-09-29', '2024-09-30'],
            rates: {
                call: [0.03829, 0.03829, 0.03555, 0.03527, 0.03502, 0.03502],
                cd: [0.0383, 0.0383, 0.0384, 0.0383, 0.0382, 0.0382],
                cp: [0.0404, 0.0404, 0.0405, 0.0405, 0.0406, 0.0406],
                msp_91: [0.03629, 0.03629, 0.03657, 0.03642, 0.03642, 0.03642],
                base: [0.035, 0.035, 0.035, 0.035, 0.035, 0.035],
                treasury: {
                    y1: [0.03677, 0.03677, 0.03757, 0.0374, 0.03737, 0.03737],
                    y3: [0.03875, 0.03875, 0.0414, 0.04085, 0.04011, 0.04011],
                    y10: [0.04012, 0.04012, 0.04385, 0.04335, 0.04244, 0.04244],
                    y30: [0.03882, 0.03882, 0.04249, 0.0422, 0.04136, 0.04136]
                },
                spread: [13.7, 13.7, 24.5, 25, 23.3, 23.3],
                credit_3y: [0.0465, 0.0465, 0.0492, 0.0487, 0.0479, 0.0479]
            }
        };

        // 1년치 데이터로 확장 (약 252 거래일)
        const expandedData = {
            dates: [],
            rates: {
                call: [], cd: [], cp: [], msp_91: [], base: [],
                treasury: { y1: [], y3: [], y10: [], y30: [] },
                spread: [], credit_3y: []
            }
        };

        // 시드값 고정
        let seed = 12345;
        const seededRandom = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };

        const repetitions = Math.ceil(252 / baseData.dates.length);
        
        for (let i = repetitions - 1; i >= 0; i--) {
            baseData.dates.forEach(date => {
                const newDate = new Date(date);
                newDate.setDate(newDate.getDate() - (i * 7));
                expandedData.dates.unshift(newDate.toISOString().split('T')[0]);
            });

            Object.keys(baseData.rates).forEach(key => {
                if (key === 'treasury') {
                    Object.keys(baseData.rates.treasury).forEach(term => {
                        if (!expandedData.rates.treasury[term]) expandedData.rates.treasury[term] = [];
                        const variation = (seededRandom() * 0.002 - 0.001) * (i + 1);
                        const newRates = baseData.rates.treasury[term].map(val => val + variation);
                        expandedData.rates.treasury[term].unshift(...newRates);
                    });
                } else if (key === 'spread') {
                    const variation = (seededRandom() * 4 - 2) * (i + 1);
                    const newRates = baseData.rates[key].map(val => val + variation);
                    expandedData.rates[key].unshift(...newRates);
                } else if (key === 'base') {
                    expandedData.rates[key].unshift(...baseData.rates[key]);
                } else {
                    const variation = (seededRandom() * 0.001 - 0.0005) * (i + 1);
                    const newRates = baseData.rates[key].map(val => val + variation);
                    expandedData.rates[key].unshift(...newRates);
                }
            });
        }

        // 252일로 정확히 자르기 (가장 최근 252일만 유지)
        const startIndex = Math.max(0, expandedData.dates.length - 252);
        expandedData.dates = expandedData.dates.slice(startIndex);
        Object.keys(expandedData.rates).forEach(key => {
            if (key === 'treasury') {
                Object.keys(expandedData.rates.treasury).forEach(term => {
                    expandedData.rates.treasury[term] = expandedData.rates.treasury[term].slice(startIndex);
                });
            } else {
                expandedData.rates[key] = expandedData.rates[key].slice(startIndex);
            }
        });

        return expandedData;
    }, []);

    const getIndexByPeriod = useCallback((period) => {
        const currentDate = new Date(bondData.dates[0]);
        let targetDate = new Date(currentDate);

        switch(period) {
            case 'daily':
                targetDate.setDate(currentDate.getDate() - 1);
                break;
            case 'weekly':
                targetDate.setDate(currentDate.getDate() - 7);
                break;
            case 'monthly':
                const prevMonth = currentDate.getMonth() - 1;
                targetDate = new Date(currentDate.getFullYear(), prevMonth, currentDate.getDate());
                break;
            case 'quarterly':
                const prevQuarter = currentDate.getMonth() - 3;
                targetDate = new Date(currentDate.getFullYear(), prevQuarter, currentDate.getDate());
                break;
            case 'yearly':
                targetDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
                break;
            default:
                targetDate.setDate(currentDate.getDate() - 1);
        }

        const targetTime = targetDate.getTime();
        let closestIndex = 0;
        let closestDiff = Math.abs(new Date(bondData.dates[0]).getTime() - targetTime);

        for (let i = 1; i < bondData.dates.length; i++) {
            const diff = Math.abs(new Date(bondData.dates[i]).getTime() - targetTime);
            if (diff < closestDiff) {
                closestDiff = diff;
                closestIndex = i;
            }
        }

        return closestIndex;
    }, [bondData.dates]);

    const formatChange = useCallback((current, previous, type = 'rate') => {
        const diff = (current - previous) * (type === 'rate' ? 10000 : 1);
        if (Math.abs(diff) < 0.1) {
            if (type === 'spread') return `${current.toFixed(1)}bp 유지`;
            return `${(current * 100).toFixed(2)}% 유지`;
        }
        if (type === 'spread') return diff > 0 ? '확대' : '축소';
        return diff > 0 ? '상승' : '하락';
    }, []);

    const getComparisonText = useCallback((period) => {
        const periodText = {
            daily: '전일',
            weekly: '전주',
            monthly: '전월',
            quarterly: '전분기',
            yearly: '전년'
        }[period];

        const {
            base, call, msp_91, cp,
            treasury: { y1, y3, y10, y30 },
            credit_3y
        } = bondData.rates;

        const currentIndex = bondData.dates.length - 1;
        const compareIndex = getIndexByPeriod(period);

        const getCurrentSpread = (a, b) => (a[currentIndex] - b[currentIndex]) * 10000;
        const getPreviousSpread = (a, b) => (a[compareIndex] - b[compareIndex]) * 10000;

        const termSpreadCurrent = getCurrentSpread(y10, y3);
        const termSpreadPrevious = getPreviousSpread(y10, y3);
        const creditSpreadCurrent = getCurrentSpread(credit_3y, y3);
        const creditSpreadPrevious = getPreviousSpread(credit_3y, y3);

        const spreads = [
            `[금리차 분석]`,
            `□ 국고채 장단기 금리차(10년물-3년물)는 ${termSpreadPrevious.toFixed(1)}bp에서 ${termSpreadCurrent.toFixed(1)}bp로 ${formatChange(termSpreadCurrent, termSpreadPrevious, 'spread')}`,
            `□ 신용스프레드(회사채3년물(AA-)-국고채3년물)는 ${creditSpreadPrevious.toFixed(1)}bp에서 ${creditSpreadCurrent.toFixed(1)}bp로 ${formatChange(creditSpreadCurrent, creditSpreadPrevious, 'spread')}`
        ];

        const rates = [
            `[${periodText} 대비 증감]`,
            `● 기준금리 ${Math.abs((base[currentIndex] - base[compareIndex]) * 10000) < 0.1 ? 
                `${(base[currentIndex] * 100).toFixed(2)}% 유지` : 
                `${Math.abs((base[currentIndex] - base[compareIndex]) * 10000).toFixed(1)}bp ${formatChange(base[currentIndex], base[compareIndex])}`}, ` +
            `콜금리 ${Math.abs((call[currentIndex] - call[compareIndex]) * 10000) < 0.1 ? 
                `${(call[currentIndex] * 100).toFixed(2)}% 유지` : 
                `${Math.abs((call[currentIndex] - call[compareIndex]) * 10000).toFixed(1)}bp ${formatChange(call[currentIndex], call[compareIndex])}`}, ` +
            `통안 3개월 ${Math.abs((msp_91[currentIndex] - msp_91[compareIndex]) * 10000) < 0.1 ? 
                `${(msp_91[currentIndex] * 100).toFixed(2)}% 유지` : 
                `${Math.abs((msp_91[currentIndex] - msp_91[compareIndex]) * 10000).toFixed(1)}bp ${formatChange(msp_91[currentIndex], msp_91[compareIndex])}`}, ` +
            `CP금리 ${Math.abs((cp[currentIndex] - cp[compareIndex]) * 10000) < 0.1 ? 
                `${(cp[currentIndex] * 100).toFixed(2)}% 유지` : 
                `${Math.abs((cp[currentIndex] - cp[compareIndex]) * 10000).toFixed(1)}bp ${formatChange(cp[currentIndex], cp[compareIndex])}`}`,
            
            `● 국고채 1년 ${Math.abs((y1[currentIndex] - y1[compareIndex]) * 10000) < 0.1 ? 
                `${(y1[currentIndex] * 100).toFixed(2)}% 유지` : 
                `${Math.abs((y1[currentIndex] - y1[compareIndex]) * 10000).toFixed(1)}bp ${formatChange(y1[currentIndex], y1[compareIndex])}`}, ` +
            `3년 ${Math.abs((y3[currentIndex] - y3[compareIndex]) * 10000) < 0.1 ? 
                `${(y3[currentIndex] * 100).toFixed(2)}% 유지` : 
                `${Math.abs((y3[currentIndex] - y3[compareIndex]) * 10000).toFixed(1)}bp ${formatChange(y3[currentIndex], y3[compareIndex])}`}, ` +
            `10년 ${Math.abs((y10[currentIndex] - y10[compareIndex]) * 10000) < 0.1 ? 
                `${(y10[currentIndex] * 100).toFixed(2)}% 유지` : 
                `${Math.abs((y10[currentIndex] - y10[compareIndex]) * 10000).toFixed(1)}bp ${formatChange(y10[currentIndex], y10[compareIndex])}`}, ` +
            `30년 ${Math.abs((y30[currentIndex] - y30[compareIndex]) * 10000) < 0.1 ? 
                `${(y30[currentIndex] * 100).toFixed(2)}% 유지` : 
                `${Math.abs((y30[currentIndex] - y30[compareIndex]) * 10000).toFixed(1)}bp ${formatChange(y30[currentIndex], y30[compareIndex])}`}, ` +
            `회사채 3년(AA-) ${Math.abs((credit_3y[currentIndex] - credit_3y[compareIndex]) * 10000) < 0.1 ? 
                `${(credit_3y[currentIndex] * 100).toFixed(2)}% 유지` : 
                `${Math.abs((credit_3y[currentIndex] - credit_3y[compareIndex]) * 10000).toFixed(1)}bp ${formatChange(credit_3y[currentIndex], credit_3y[compareIndex])}`}`
        ];

        return [
            ...spreads,
            `\n${rates[0]}`,
            rates[1],
            rates[2]
        ].join('\n');
    }, [bondData, getIndexByPeriod, formatChange]);

    // 컴포넌트 마운트 시 전일대비 데이터 표시
    useEffect(() => {
        const period = 'daily';
        setComparisonText(getComparisonText(period));
    }, [getComparisonText]);

    const handlePeriodChange = useCallback((period) => {
        setSelectedPeriod(period);
        setComparisonText(getComparisonText(period));
    }, [getComparisonText]);

    // 날짜 포맷팅 함수 추가
    const formatDate = useCallback((dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }, []);

    // 선택된 기간의 날짜 범위를 반환하는 함수
    const getDateRange = useCallback((period) => {
        const lastIndex = bondData.dates.length - 1;
        const endDate = new Date(bondData.dates[lastIndex]);
        let startDate = new Date(bondData.dates[lastIndex]);

        switch(period) {
            case 'daily':
                startDate.setDate(endDate.getDate() - 1);
                break;
            case 'weekly':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case 'monthly':
                startDate.setMonth(endDate.getMonth() - 1);
                break;
            case 'quarterly':
                startDate.setMonth(endDate.getMonth() - 3);
                break;
            case 'yearly':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(endDate.getDate() - 1);
                break;
        }

        return {
            current: formatDate(endDate),
            compare: formatDate(startDate)
        };
    }, [bondData.dates, formatDate]);

    return (
        <Card className="bg-gray-800 text-white w-1/2">
            <CardContent className="p-4">
                <h3 className="text-xl font-semibold mb-6 flex items-center border-b border-gray-700 pb-3">
                    <span className="mr-2" role="img" aria-label="chart">📊</span>
                    <span className="text-blue-200">국내 채권시장 분석</span>
                </h3>

                <div className="space-y-">
                    <div className="relative inline-block mb-4">
                        <div className="flex items-center gap-4">
                            <div className="relative inline-block">
                                <select
                                    value={selectedPeriod}
                                    onChange={(e) => handlePeriodChange(e.target.value)}
                                    className="appearance-none bg-gray-700 text-white text-sm px-3 py-1.5 pr-8 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:bg-gray-600 transition-colors duration-200"
                                >
                                    {PERIODS.map(period => (
                                        <option key={period.id} value={period.id}>{period.label}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-sm text-gray-400">
                                ({getDateRange(selectedPeriod).compare} ~ {getDateRange(selectedPeriod).current})
                            </span>
                        </div>
                    </div>

                    <section className="bg-gray-900/50 rounded-lg p-4">
                        <h4 className="font-medium text-green-300 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-green-300 rounded-full mr-2"></span>
                            국내 채권시장 동향
                        </h4>
                        <p className="leading-relaxed text-gray-200 text-sm whitespace-pre-line">
                            국고채 장단기 금리는 대외 금리 상승과 국내 물가지표 부진 등의 영향으로 전구간에서 상승세를 보였습니다.
                            특히 장기물 금리가 큰 폭으로 상승하며 장단기 스프레드가 확대되었고, 
                            신용스프레드는 회사채 발행 증가와 투자심리 위축으로 소폭 확대되었습니다.
                            
                            한편, 단기금융시장은 MMF 수신 감소에도 불구하고 CP금리가 안정적인 흐름을 보이고 있으며,
                            콜금리는 기준금리를 중심으로 안정적인 움직임을 지속하고 있습니다.
                        </p>
                    </section>

                    <section className="bg-gray-900/50 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-300 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-yellow-300 rounded-full mr-2"></span>
                            금리차 분석
                        </h4>
                        <p className="leading-relaxed text-gray-200 text-sm whitespace-pre-line">
                            {comparisonText.split('\n').slice(1, 3).join('\n')}
                        </p>
                    </section>

                    <section className="bg-gray-900/50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-300 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                            증감 분석
                        </h4>
                        <p className="leading-relaxed text-gray-200 text-sm whitespace-pre-line">
                            {comparisonText.split('\n').slice(4).join('\n')}
                        </p>
                    </section>
                </div>
            </CardContent>
        </Card>
    );
};

export default DomesticBondAnalysis;

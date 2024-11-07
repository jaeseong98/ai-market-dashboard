import { Card, CardContent } from '../../../components/Card.js'
import { useState, useMemo, useCallback, useEffect } from 'react'

const PERIODS = [
    { id: 'daily', label: '전일대비' },
    { id: 'weekly', label: '전주대비' },
    { id: 'monthly', label: '전월대비' },
    { id: 'quarterly', label: '전분기대비' },
    { id: 'yearly', label: '전년대비' }
];

const GlobalMarketAnalysis = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('daily');
    const [analysisText, setAnalysisText] = useState({ equity: '', bonds: '' });

    const globalData = useMemo(() => {
        const baseData = {
            dates: ['2024-09-25', '2024-09-26', '2024-09-27', '2024-09-28', '2024-09-29', '2024-09-30'],
            equity: {
                msci_acwi: [-0.0215, 0.0116, -0.0147, -0.0222, -0.0155, -0.0196],
                msci_dm: [-0.0185, 0.0142, -0.0235, -0.0292, -0.0338, -0.0246],
                msci_em: [-0.0256, 0.0183, -0.0166, -0.0263, -0.0152, -0.0122],
                nasdaq: [-0.0312, 0.0258, 0.0158, -0.0273, -0.0182, -0.0194],
                sp500: [-0.0225, 0.0167, -0.0125, -0.0158, -0.0192, -0.0238],
                stoxx600: [-0.0156, 0.0134, -0.0187, -0.0226, -0.0126, -0.0159]
            },
            bonds: {
                us: {
                    policy_rate: [5.50, 5.50, 5.45, 5.45, 5.40, 5.40],
                    y1: [4.224, 4.324, 4.524, 4.424, 4.324, 4.424],
                    y3: [3.753, 3.853, 4.153, 3.953, 3.853, 3.953],
                    y10: [3.987, 4.087, 4.387, 4.187, 4.087, 4.187],
                    y30: [4.324, 4.424, 4.724, 4.524, 4.424, 4.524]
                },
                japan: {
                    policy_rate: [0.265, 0.265, 0.275, 0.275, 0.285, 0.285],
                    y1: [0.415, 0.435, 0.455, 0.435, 0.415, 0.425],
                    y3: [0.515, 0.535, 0.555, 0.535, 0.515, 0.525],
                    y10: [0.884, 0.914, 0.934, 0.914, 0.894, 0.904]
                },
                europe: {
                    policy_rate: [4.094, 4.094, 4.084, 4.084, 4.074, 4.074],
                    y1: [3.921, 4.021, 4.221, 4.121, 3.921, 4.021],
                    y3: [3.955, 4.055, 4.255, 4.155, 3.955, 4.055],
                    y10: [4.132, 4.232, 4.432, 4.332, 4.132, 4.232],
                    y30: [4.466, 4.566, 4.766, 4.666, 4.466, 4.566]
                }
            }
        };

        // 1년치 데이터로 확장
        const expandedData = {
            dates: [],
            equity: {
                msci_acwi: [], msci_dm: [], msci_em: [],
                nasdaq: [], sp500: [], stoxx600: []
            },
            bonds: {
                us: { policy_rate: [], y1: [], y3: [], y10: [], y30: [] },
                japan: { policy_rate: [], y1: [], y3: [], y10: [] },
                europe: { policy_rate: [], y1: [], y3: [], y10: [], y30: [] }
            }
        };

        const repetitions = Math.ceil(252 / baseData.dates.length);

        let seed = 12345;
        const seededRandom = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };

        for (let i = repetitions - 1; i >= 0; i--) {
            baseData.dates.forEach(date => {
                const newDate = new Date(date);
                newDate.setDate(newDate.getDate() - (i * 7));
                expandedData.dates.unshift(newDate.toISOString().split('T')[0]);
            });

            Object.keys(baseData.equity).forEach(key => {
                const variation = (seededRandom() * 0.02 - 0.01) * (i + 1);
                expandedData.equity[key].unshift(...baseData.equity[key].map(val => 
                    val + variation
                ));
            });

            Object.keys(baseData.bonds).forEach(country => {
                Object.keys(baseData.bonds[country]).forEach(term => {
                    const isRate = term === 'policy_rate';
                    const variation = isRate 
                        ? (seededRandom() * 0.001 - 0.0005) * (i + 1)
                        : (seededRandom() * 0.005 - 0.0025) * (i + 1);
                    expandedData.bonds[country][term].unshift(...baseData.bonds[country][term].map(val => 
                        val + variation
                    ));
                });
            });
        }

        // 252일로 자르기
        expandedData.dates = expandedData.dates.slice(0, 252);
        Object.keys(expandedData.equity).forEach(key => {
            expandedData.equity[key] = expandedData.equity[key].slice(0, 252);
        });
        Object.keys(expandedData.bonds).forEach(country => {
            Object.keys(expandedData.bonds[country]).forEach(term => {
                expandedData.bonds[country][term] = expandedData.bonds[country][term].slice(0, 252);
            });
        });

        return expandedData;
    }, []);

    const getIndexByPeriod = useCallback((period) => {
        const currentDate = new Date(globalData.dates[0]);
        let targetDate = new Date(currentDate);

        switch(period) {
            case 'daily':
                targetDate.setDate(currentDate.getDate() - 1);
                break;
            case 'weekly':
                targetDate.setDate(currentDate.getDate() - 7);
                break;
            case 'monthly':
                targetDate.setMonth(currentDate.getMonth() - 1);
                break;
            case 'quarterly':
                targetDate.setMonth(currentDate.getMonth() - 3);
                break;
            case 'yearly':
                targetDate.setFullYear(currentDate.getFullYear() - 1);
                break;
            default:
                targetDate.setDate(currentDate.getDate() - 1);
                break;
        }

        const targetTime = targetDate.getTime();
        return globalData.dates.findIndex(date => 
            new Date(date).getTime() >= targetTime
        );
    }, [globalData.dates]);

    const formatChange = useCallback((current, previous, type = 'rate') => {
        const diff = current - previous;
        
        // bp 단위로 계산할 경우
        if (type === 'bp') {
            const bpDiff = diff * 100;  // bp로 변환
            if (Math.abs(bpDiff) < 0.1) {
                return `${(current * 100).toFixed(2)}% 유지`;
            }
            return `${Math.abs(bpDiff).toFixed(1)}bp ${bpDiff > 0 ? '상승' : '하락'}`;
        }
        
        // 비율(%) 단위로 계산할 경우
        const percentDiff = diff * 100;  // %로 변환
        if (Math.abs(percentDiff) < 0.01) {
            return `${(current * 100).toFixed(2)}% 유지`;
        }
        return `${Math.abs(percentDiff).toFixed(2)}% ${percentDiff > 0 ? '상승' : '하락'}`;
    }, []);

    const getAnalysisText = useCallback((period) => {
        const currentIndex = 0;
        const compareIndex = getIndexByPeriod(period);

        const equityAnalysis = [
            `[${period === 'daily' ? '전일' : 
               period === 'weekly' ? '전주' : 
               period === 'monthly' ? '전월' : 
               period === 'quarterly' ? '전분기' : '전년'} 대비 증감]`,
            `● MSCI ACWI ${formatChange(globalData.equity.msci_acwi[currentIndex], globalData.equity.msci_acwi[compareIndex])}, ` +
            `MSCI DM ${formatChange(globalData.equity.msci_dm[currentIndex], globalData.equity.msci_dm[compareIndex])}, ` +
            `MSCI EM ${formatChange(globalData.equity.msci_em[currentIndex], globalData.equity.msci_em[compareIndex])}`,
            `● 나스닥 종합 ${formatChange(globalData.equity.nasdaq[currentIndex], globalData.equity.nasdaq[compareIndex])}, ` +
            `S&P500 ${formatChange(globalData.equity.sp500[currentIndex], globalData.equity.sp500[compareIndex])}, ` +
            `STOXX600 ${formatChange(globalData.equity.stoxx600[currentIndex], globalData.equity.stoxx600[compareIndex])}`
        ];

        const bondAnalysis = [
            '[해외 주요국 글로벌 통화정책]',
            `● 미국 기준금리 ${Math.abs(globalData.bonds.us.policy_rate[currentIndex] - globalData.bonds.us.policy_rate[compareIndex]) < 0.001 ? 
                `${(globalData.bonds.us.policy_rate[currentIndex]).toFixed(2)}% 유지` : 
                `${Math.abs((globalData.bonds.us.policy_rate[currentIndex] - globalData.bonds.us.policy_rate[compareIndex]) * 100).toFixed(1)}bp ${globalData.bonds.us.policy_rate[currentIndex] > globalData.bonds.us.policy_rate[compareIndex] ? '상승' : '하락'}`}, ` +
            `일본 기준금리 ${Math.abs(globalData.bonds.japan.policy_rate[currentIndex] - globalData.bonds.japan.policy_rate[compareIndex]) < 0.001 ? 
                `${(globalData.bonds.japan.policy_rate[currentIndex]).toFixed(2)}% 유지` : 
                `${Math.abs((globalData.bonds.japan.policy_rate[currentIndex] - globalData.bonds.japan.policy_rate[compareIndex]) * 100).toFixed(1)}bp ${globalData.bonds.japan.policy_rate[currentIndex] > globalData.bonds.japan.policy_rate[compareIndex] ? '상승' : '하락'}`}, ` +
            `유럽 중앙은행 기준금리 ${Math.abs(globalData.bonds.europe.policy_rate[currentIndex] - globalData.bonds.europe.policy_rate[compareIndex]) < 0.001 ? 
                `${(globalData.bonds.europe.policy_rate[currentIndex]).toFixed(2)}% 유지` : 
                `${Math.abs((globalData.bonds.europe.policy_rate[currentIndex] - globalData.bonds.europe.policy_rate[compareIndex]) * 100).toFixed(1)}bp ${globalData.bonds.europe.policy_rate[currentIndex] > globalData.bonds.europe.policy_rate[compareIndex] ? '상승' : '하락'}`}`,

            `[${period === 'daily' ? '전일' : 
               period === 'weekly' ? '전주' : 
               period === 'monthly' ? '전월' : 
               period === 'quarterly' ? '전분기' : '전년'} 대비 증감]`,
            `● 미국 국채 1년 ${formatChange(globalData.bonds.us.y1[currentIndex], globalData.bonds.us.y1[compareIndex], 'bp')}, ` +
            `3년 ${formatChange(globalData.bonds.us.y3[currentIndex], globalData.bonds.us.y3[compareIndex], 'bp')}, ` +
            `10년 ${formatChange(globalData.bonds.us.y10[currentIndex], globalData.bonds.us.y10[compareIndex], 'bp')}, ` +
            `30년 ${formatChange(globalData.bonds.us.y30[currentIndex], globalData.bonds.us.y30[compareIndex], 'bp')}`
        ];

        return {
            equity: equityAnalysis.join('\n'),
            bonds: bondAnalysis.join('\n')
        };
    }, [globalData, getIndexByPeriod, formatChange]);

    const formatDate = useCallback((dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }, []);

    const getDateRange = useCallback((period) => {
        const endDate = new Date(globalData.dates[0]);
        let startDate = new Date(globalData.dates[0]);

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
    }, [globalData.dates, formatDate]);

    const handlePeriodChange = useCallback((period) => {
        setSelectedPeriod(period);
        const newAnalysisText = getAnalysisText(period);
        setAnalysisText(newAnalysisText);
    }, [getAnalysisText]);

    useEffect(() => {
        const initialAnalysisText = getAnalysisText('daily');
        setAnalysisText(initialAnalysisText);
    }, [getAnalysisText]);

    const dateRange = getDateRange(selectedPeriod);

    return (
        <Card className="bg-gray-800 text-white w-1/2">
            <CardContent className="p-4">
                <h3 className="text-xl font-semibold mb-6 flex items-center border-b border-gray-700 pb-3">
                    <span className="mr-2" role="img" aria-label="globe">🌎</span>
                    <span className="text-blue-200">글로벌 시장 동향</span>
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative inline-block">
                            <select
                                onChange={(e) => handlePeriodChange(e.target.value)}
                                value={selectedPeriod}
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
                            ({dateRange.compare} ~ {dateRange.current})
                        </span>
                    </div>

                    <section className="bg-gray-900/50 rounded-lg p-4">
                        <h4 className="font-medium text-green-300 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-green-300 rounded-full mr-2"></span>
                            글로벌 금융시장 동향
                        </h4>
                        <p className="leading-relaxed text-gray-200 text-sm whitespace-pre-line">
                            글로벌 금리는 미국의 인플레이션 우려와 연준의 매파적 기조 지속으로 상승세를 보였습니다.
                            특히 미국 국채 10년물 금리는 경제지표 호조와 국채 발행 확대 우려로 큰 폭 상승했으며,
                            유럽과 일본 금리도 미국 금리 상승의 영향으로 동반 상승했습니다.

                            한편, 주요국 중앙은행들은 현재 금리수준을 유지하며 인플레이션 추이를 주시하고 있으며,
                            시장은 향후 통화정책 완화 시기에 주목하고 있습니다.
                        </p>
                    </section>

                    <section className="bg-gray-900/50 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-300 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-yellow-300 rounded-full mr-2"></span>
                            해외 주식
                        </h4>
                        <p className="leading-relaxed text-gray-200 text-sm whitespace-pre-line">
                            {analysisText.equity}
                        </p>
                    </section>

                    <section className="bg-gray-900/50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-300 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                            해외 채권
                        </h4>
                        <p className="leading-relaxed text-gray-200 text-sm whitespace-pre-line">
                            {analysisText.bonds}
                        </p>
                    </section>
                </div>
            </CardContent>
        </Card>
    );
};

export default GlobalMarketAnalysis; 
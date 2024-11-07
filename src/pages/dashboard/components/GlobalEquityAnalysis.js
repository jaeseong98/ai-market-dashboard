import { Card, CardContent } from '../../../components/Card.js'
import { useState, useMemo, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PERIODS = [
    { id: 'daily', label: '전일대비' },
    { id: 'weekly', label: '전주대비' },
    { id: 'monthly', label: '전월대비' },
    { id: 'quarterly', label: '전분기대비' },
    { id: 'yearly', label: '전년대비' }
];

// EQUITY_INDICATORS 상수 추가
const EQUITY_INDICATORS = [
    { id: 'msci_acwi', label: 'MSCI ACWI', color: '#8884d8' },
    { id: 'msci_dm', label: 'MSCI DM', color: '#82ca9d' },
    { id: 'msci_em', label: 'MSCI EM', color: '#ffc658' },
    { id: 'nasdaq', label: 'NASDAQ', color: '#ff7300' },
    { id: 'sp500', label: 'S&P500', color: '#0088fe' },
    { id: 'stoxx600', label: 'STOXX600', color: '#00c49f' }
];

const GlobalEquityAnalysis = () => {
    const [selectedEquityPeriod, setSelectedEquityPeriod] = useState('daily');
    const [selectedEquityIndicator, setSelectedEquityIndicator] = useState('msci_acwi');
    const [equityViewMode, setEquityViewMode] = useState('graph');

    // globalData 정의
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
            }
        };

        const expandedData = {
            dates: [],
            equity: {
                msci_acwi: [], msci_dm: [], msci_em: [],
                nasdaq: [], sp500: [], stoxx600: []
            }
        };

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

            Object.keys(baseData.equity).forEach(key => {
                const variation = (seededRandom() * 0.02 - 0.01) * (i + 1);
                expandedData.equity[key].unshift(...baseData.equity[key].map(val => 
                    val + variation
                ));
            });
        }

        const startIndex = Math.max(0, expandedData.dates.length - 252);
        expandedData.dates = expandedData.dates.slice(startIndex);
        
        Object.keys(expandedData.equity).forEach(key => {
            expandedData.equity[key] = expandedData.equity[key].slice(startIndex);
        });

        return expandedData;
    }, []);

    const formatAxisDate = useCallback((dateString) => {
        const date = new Date(dateString);
        const year = String(date.getFullYear()).slice(2);  // 2024 -> 24
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}.${month}`;
    }, []);

    const formatTooltipDate = useCallback((date) => {
        const d = new Date(date);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    }, []);

    const formatFullDate = useCallback((date) => {
        const d = new Date(date);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
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
                return 1;
        }

        const index = globalData.dates.findIndex(date => new Date(date) <= targetDate);
        return index === -1 ? globalData.dates.length - 1 : index;
    }, [globalData.dates]);

    // 그래프 데이터 비 함수
    const prepareEquityGraphData = useCallback(() => {
        const compareIndex = getIndexByPeriod(selectedEquityPeriod);
        const filteredDates = globalData.dates.slice(0, compareIndex + 1);
        
        return filteredDates.map((date, index) => {
            const value = globalData.equity[selectedEquityIndicator][index];
            const formattedDate = formatAxisDate(date);
            
            return {
                date: formattedDate,
                fullDate: formatTooltipDate(date),
                value: value * 100,
                indicator: EQUITY_INDICATORS.find(i => i.id === selectedEquityIndicator)?.label
            };
        }).reverse();
    }, [
        globalData, 
        selectedEquityIndicator, 
        selectedEquityPeriod, 
        formatAxisDate, 
        formatTooltipDate,
        getIndexByPeriod
    ]);

    // 테이블 데이터 준비 함수
    const prepareEquityTableData = useCallback(() => {
        const compareIndex = getIndexByPeriod(selectedEquityPeriod);
        const filteredDates = globalData.dates.slice(0, compareIndex + 1);
        
        return filteredDates.map((date, index) => {
            const value = globalData.equity[selectedEquityIndicator][index];
            return {
                date: formatFullDate(date),
                value: `${(value * 100).toFixed(2)}`
            };
        });
    }, [
        globalData, 
        selectedEquityIndicator, 
        selectedEquityPeriod,
        formatFullDate,
        getIndexByPeriod
    ]);

    // 분석 텍스트 생성
    const getEquityAnalysisText = useCallback(() => {
        return `글로벌 금리는 미국의 인플레이션 우려와 연준의 매파적 기조 지속으로 상승세를 보였습니다. 특히 미국 국채 10년물 금리는 경제지표 호조와 국채 발행 확대 우려로 큰 폭 상승했으며, 유럽과 일본 금리도 미국 금리 상승의 영향으로 동반 상승했습니다. 한편, 주요국 중앙은행들은 현재 금리수준을 유지하며 인플레이션 추이를 주시하고 있으며, 시장은 향후 통화정책 완화 시기에 주목하고 있습니다.`;
    }, []);

    // 증감률 텍스트 생성
    const getEquityChangeText = useCallback(() => {
        const periodLabels = {
            'daily': '전일 대비',
            'weekly': '전주 대비',
            'monthly': '전월 대비',
            'quarterly': '전분기 대비',
            'yearly': '전년 대비'
        };

        const compareIndex = getIndexByPeriod(selectedEquityPeriod);
        const currentIndex = 0;

        // 기간별 증감 텍스트
        const periodText = `[${periodLabels[selectedEquityPeriod]} 증감]`;

        // MSCI 지수들의 변화
        const msciChanges = ['msci_acwi', 'msci_dm', 'msci_em'].map(id => {
            const current = globalData.equity[id][currentIndex];
            const compare = globalData.equity[id][compareIndex];
            const change = ((current - compare) / Math.abs(compare)) * 100;
            const indicator = EQUITY_INDICATORS.find(i => i.id === id)?.label;
            return `${indicator} ${Math.abs(change).toFixed(2)}% ${change > 0 ? '상승' : '하락'}`;
        }).join(', ');

        // 기타 지수들의 변화
        const otherChanges = ['nasdaq', 'sp500', 'stoxx600'].map(id => {
            const current = globalData.equity[id][currentIndex];
            const compare = globalData.equity[id][compareIndex];
            const change = ((current - compare) / Math.abs(compare)) * 100;
            const indicator = EQUITY_INDICATORS.find(i => i.id === id)?.label;
            return `${indicator} ${Math.abs(change).toFixed(2)}% ${change > 0 ? '상승' : '하락'}`;
        }).join(', ');

        return `${periodText}\n● ${msciChanges}\n● ${otherChanges}`;
    }, [globalData, selectedEquityPeriod, getIndexByPeriod]);

    // getDateRange 함수 추가
    const getDateRange = useCallback((period) => {
        const currentDate = new Date();
        let compareDate = new Date(currentDate);

        switch(period) {
            case 'daily':
                compareDate.setDate(currentDate.getDate() - 1);
                break;
            case 'weekly':
                compareDate.setDate(currentDate.getDate() - 7);
                break;
            case 'monthly':
                compareDate.setMonth(currentDate.getMonth() - 1);
                break;
            case 'quarterly':
                compareDate.setMonth(currentDate.getMonth() - 3);
                break;
            case 'yearly':
                compareDate.setFullYear(currentDate.getFullYear() - 1);
                break;
            default:
                compareDate.setDate(currentDate.getDate() - 1);
        }

        return {
            compare: `${compareDate.getFullYear()}.${String(compareDate.getMonth() + 1).padStart(2, '0')}.${String(compareDate.getDate()).padStart(2, '0')}`,
            current: `${currentDate.getFullYear()}.${String(currentDate.getMonth() + 1).padStart(2, '0')}.${String(currentDate.getDate()).padStart(2, '0')}`
        };
    }, []);

    return (
        <Card className="bg-gray-800 text-white w-[calc(33.333%-1rem)]">
            <CardContent className="p-4">
                <h3 className="text-xl font-semibold mb-4 flex items-center border-b border-gray-700 pb-3">
                    <span className="mr-2" role="img" aria-label="globe">🌎</span>
                    <span className="text-blue-200">해외 주식시장</span>
                </h3>

                {/* 날짜 선택 */}
                <div className="mb-6 flex items-center gap-4">
                    <select
                        value={selectedEquityPeriod}
                        onChange={(e) => setSelectedEquityPeriod(e.target.value)}
                        className="appearance-none bg-gray-700 text-white text-sm px-3 py-1.5 pr-8 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:bg-gray-600 transition-colors duration-200"
                    >
                        {PERIODS.map(period => (
                            <option key={period.id} value={period.id}>
                                {period.label}
                            </option>
                        ))}
                    </select>
                    <span className="text-sm text-gray-400">
                        ({getDateRange(selectedEquityPeriod).compare} ~ {getDateRange(selectedEquityPeriod).current})
                    </span>
                </div>

                {/* 글로벌 주식시장 동향 섹션 */}
                <section className="bg-gray-900/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                        <span className="font-medium text-green-300">글로벌 주식시장 동향</span>
                    </div>
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">
                        {getEquityAnalysisText()}
                    </p>
                </section>

                {/* 해외 주식 섹션 */}
                <section className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-yellow-300 rounded-full"></span>
                        <span className="text-yellow-300 font-medium">해외 주식</span>
                    </div>
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line mb-4">
                        {getEquityChangeText()}
                    </p>

                    {/* 그래프/테이블 컨트롤 */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <select
                                value={selectedEquityIndicator}
                                onChange={(e) => setSelectedEquityIndicator(e.target.value)}
                                className="appearance-none bg-gray-700 text-white text-sm px-3 py-1.5 pr-8 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:bg-gray-600 transition-colors duration-200"
                            >
                                {EQUITY_INDICATORS.map(indicator => (
                                    <option key={indicator.id} value={indicator.id}>
                                        {indicator.label}
                                    </option>
                                ))}
                            </select>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setEquityViewMode('graph')}
                                    className={`px-3 py-1.5 rounded-md text-sm ${
                                        equityViewMode === 'graph' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    그래프
                                </button>
                                <button
                                    onClick={() => setEquityViewMode('table')}
                                    className={`px-3 py-1.5 rounded-md text-sm ${
                                        equityViewMode === 'table' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    테이블
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 그래프/테이블 뷰 */}
                    {equityViewMode === 'graph' ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={prepareEquityGraphData()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
                                    <XAxis 
                                        dataKey="date"
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        interval={20}
                                        height={50}
                                        axisLine={{ stroke: '#4B5563' }}
                                        tickLine={{ stroke: '#4B5563' }}
                                    />
                                    <YAxis 
                                        tick={{ fill: '#9CA3AF', fontSize: 10 }}
                                        axisLine={{ stroke: '#4B5563' }}
                                        tickLine={{ stroke: '#4B5563' }}
                                        tickFormatter={(value) => `${value}%`}
                                        width={35}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#1F2937',
                                            border: 'none',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            padding: '6px'
                                        }}
                                        formatter={(value) => [`${value.toFixed(2)}%`]}
                                        labelFormatter={(label) => label}
                                    />
                                    <Line 
                                        type="monotone"
                                        dataKey="value"
                                        stroke={EQUITY_INDICATORS.find(i => i.id === selectedEquityIndicator)?.color}
                                        dot={false}
                                        strokeWidth={1.5}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-64">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr>
                                        <th className="text-left py-1 px-2 text-gray-300">날짜</th>
                                        <th className="text-right py-1 px-2 text-gray-300">
                                            {EQUITY_INDICATORS.find(i => i.id === selectedEquityIndicator)?.label}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prepareEquityTableData().map((row) => (
                                        <tr key={row.date}>
                                            <td className="text-left py-1 px-2 text-gray-300">{row.date}</td>
                                            <td className="text-right py-1 px-2 text-gray-300">{row.value}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </CardContent>
        </Card>
    );
};

export default GlobalEquityAnalysis; 
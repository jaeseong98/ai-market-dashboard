import { Card, CardContent } from '../../../../components/Card.js'
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PERIODS = [
    { id: 'daily', label: '전일대비' },
    { id: 'weekly', label: '전주대비' },
    { id: 'monthly', label: '전월대비' },
    { id: 'quarterly', label: '전분기대비' },
    { id: 'yearly', label: '전년대비' }
];

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
    const [analysisText, setAnalysisText] = useState({ equity: '' });
    const [equityMenuOpen, setEquityMenuOpen] = useState(false);
    const equityMenuRef = useRef(null);
    const [selectedEquityIndicator, setSelectedEquityIndicator] = useState('msci_acwi');
    const [equityViewMode, setEquityViewMode] = useState('graph');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (equityMenuRef.current && !equityMenuRef.current.contains(event.target)) {
                setEquityMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
        let closestDiff = Math.abs(new Date(globalData.dates[0]).getTime() - targetTime);

        for (let i = 1; i < globalData.dates.length; i++) {
            const diff = Math.abs(new Date(globalData.dates[i]).getTime() - targetTime);
            if (diff < closestDiff) {
                closestDiff = diff;
                closestIndex = i;
            }
        }

        return closestIndex;
    }, [globalData.dates]);

    const formatChange = useCallback((current, previous) => {
        const diff = current - previous;
        const percentDiff = diff * 100;
        if (Math.abs(percentDiff) < 0.01) {
            return `${(current * 100).toFixed(2)}% 유지`;
        }
        return `${Math.abs(percentDiff).toFixed(2)}% ${percentDiff > 0 ? '상승' : '하락'}`;
    }, []);

    const getAnalysisText = useCallback((equityPeriod) => {
        const equityAnalysis = [
            `[${equityPeriod === 'daily' ? '전일' : 
               equityPeriod === 'weekly' ? '전주' : 
               equityPeriod === 'monthly' ? '전월' : 
               equityPeriod === 'quarterly' ? '전분기' : '전년'} 대비 증감]`,
            `● MSCI ACWI ${formatChange(globalData.equity.msci_acwi[0], globalData.equity.msci_acwi[getIndexByPeriod(equityPeriod)])}, ` +
            `MSCI DM ${formatChange(globalData.equity.msci_dm[0], globalData.equity.msci_dm[getIndexByPeriod(equityPeriod)])}, ` +
            `MSCI EM ${formatChange(globalData.equity.msci_em[0], globalData.equity.msci_em[getIndexByPeriod(equityPeriod)])}`,
            `● NASDAQ ${formatChange(globalData.equity.nasdaq[0], globalData.equity.nasdaq[getIndexByPeriod(equityPeriod)])}, ` +
            `S&P500 ${formatChange(globalData.equity.sp500[0], globalData.equity.sp500[getIndexByPeriod(equityPeriod)])}, ` +
            `STOXX600 ${formatChange(globalData.equity.stoxx600[0], globalData.equity.stoxx600[getIndexByPeriod(equityPeriod)])}`
        ];

        return {
            equity: equityAnalysis.join('\n')
        };
    }, [globalData, getIndexByPeriod, formatChange]);

    const formatDate = useCallback((dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear().toString().slice(2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    }, []);

    const formatTooltipDate = useCallback((dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    const formatAxisDate = useCallback((dateString) => {
        const date = new Date(dateString);
        const year = String(date.getFullYear()).slice(2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}.${month}`;
    }, []);

    const formatFullDate = useCallback((dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    const getDateRange = useCallback((period) => {
        const lastIndex = globalData.dates.length - 1;
        const endDate = new Date(globalData.dates[lastIndex]);
        let startDate = new Date(globalData.dates[lastIndex]);

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
        }

        return {
            current: formatDate(endDate),
            compare: formatDate(startDate)
        };
    }, [globalData.dates, formatDate]);

    const handleEquityPeriodChange = useCallback((period) => {
        setSelectedEquityPeriod(period);
        const newAnalysisText = getAnalysisText(period);
        setAnalysisText(newAnalysisText);
    }, [getAnalysisText]);

    const prepareEquityGraphData = useCallback(() => {
        const compareIndex = getIndexByPeriod(selectedEquityPeriod);
        const filteredDates = globalData.dates.slice(0, compareIndex + 1);
        
        return filteredDates.map((date, index) => {
            const value = globalData.equity[selectedEquityIndicator][index];
            
            return {
                date: formatAxisDate(date),
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
    }, [globalData, selectedEquityIndicator, selectedEquityPeriod, formatFullDate, getIndexByPeriod]);

    useEffect(() => {
        const initialAnalysisText = getAnalysisText('daily');
        setAnalysisText(initialAnalysisText);
    }, [getAnalysisText]);

    return (
        <Card className="bg-gray-800 text-white w-full">
            <CardContent className="p-4">
                <h3 className="text-xl font-semibold mb-6 flex items-center border-b border-gray-700 pb-3">
                    <span className="mr-2" role="img" aria-label="globe">🌎</span>
                    <span className="text-blue-200">해외 주식시장</span>
                </h3>

                <div className="mb-6 flex items-center gap-4">
                    <div className="relative inline-block">
                        <select
                            onChange={(e) => handleEquityPeriodChange(e.target.value)}
                            value={selectedEquityPeriod}
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
                        ({getDateRange(selectedEquityPeriod).compare} ~ {getDateRange(selectedEquityPeriod).current})
                    </span>
                </div>

                <div className="space-y-2">
                    <section className="bg-gray-900/50 rounded-lg p-4">
                        <h4 className="font-medium text-green-300 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-green-300 rounded-full mr-2"></span>
                            글로벌 금융시장 동향(임시)
                        </h4>
                        <p className="leading-relaxed text-gray-200 text-sm whitespace-pre-line">
                            글로벌 주식시장은 미국의 인플레이션 우려와 연준의 매파적 기조 지속으로 하락세를 보였습니다.
                            특히 기술주 중심의 나스닥 지수가 큰 폭으로 하락했으며, 
                            유럽과 아시아 주요 증시도 미국 증시의 영향으로 동반 하락했습니다.
                        </p>
                    </section>

                    <section className="bg-gray-900/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="relative" ref={equityMenuRef}>
                                <button 
                                    onClick={() => setEquityMenuOpen(!equityMenuOpen)}
                                    className="flex items-center gap-2 font-medium text-yellow-300 hover:text-yellow-200 transition-colors duration-200"
                                >
                                    <span className="w-2 h-2 bg-yellow-300 rounded-full"></span>
                                    해외 주식(룰 기반)
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {equityMenuOpen && (
                                    <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5">
                                        <div className="py-1">
                                            {PERIODS.map(period => (
                                                <button
                                                    key={period.id}
                                                    onClick={() => {
                                                        handleEquityPeriodChange(period.id);
                                                        setEquityMenuOpen(false);
                                                    }}
                                                    className={`block w-full text-left px-4 py-2 text-sm ${
                                                        selectedEquityPeriod === period.id 
                                                        ? 'bg-gray-600 text-white' 
                                                        : 'text-gray-200 hover:bg-gray-600'
                                                    }`}
                                                >
                                                    {period.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <span className="text-sm text-gray-400">
                                ({getDateRange(selectedEquityPeriod).compare} ~ {getDateRange(selectedEquityPeriod).current})
                            </span>
                        </div>
                        <p className="leading-relaxed text-gray-200 text-sm whitespace-pre-line mb-10">
                            {analysisText.equity}
                        </p>

                        <div className="flex items-center gap-4 mb-4">
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
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setEquityViewMode('graph')}
                                    className={`px-2 py-2 text-sm rounded-md ${
                                        equityViewMode === 'graph' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    그래프
                                </button>
                                <button
                                    onClick={() => setEquityViewMode('table')}
                                    className={`px-2 py-2 text-sm rounded-md ${
                                        equityViewMode === 'table' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    테이블
                                </button>
                            </div>
                        </div>

                        {equityViewMode === 'graph' ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={prepareEquityGraphData()} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                        <CartesianGrid 
                                            strokeDasharray="3 3" 
                                            stroke="#374151" 
                                            horizontal={true}
                                            vertical={false}
                                        />
                                        <XAxis 
                                            dataKey="date" 
                                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                            interval={20}
                                            height={50}
                                            axisLine={{ stroke: '#4B5563' }}
                                            tickLine={{ stroke: '#4B5563' }}
                                        />
                                        <YAxis 
                                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                            domain={['dataMin', 'dataMax']}
                                            tickFormatter={(value) => value.toFixed(2)}
                                            axisLine={{ stroke: '#4B5563' }}
                                            tickLine={{ stroke: '#4B5563' }}
                                            width={50}
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#1F2937', 
                                                border: 'none',
                                                borderRadius: '4px',
                                                padding: '8px'
                                            }}
                                            labelStyle={{ color: '#FFFFFF' }}
                                            formatter={(value, name, props) => [
                                                `${props.payload.indicator} ${value.toFixed(2)}%`
                                            ]}
                                            labelFormatter={(label, payload) => {
                                                if (payload && payload[0]) {
                                                    return payload[0].payload.fullDate;
                                                }
                                                return label;
                                            }}
                                            separator=""
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
                            <div className="overflow-x-auto max-h-64 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-gray-800">
                                        <tr>
                                            <th className="py-2 px-4 text-left font-medium text-gray-300 border-b border-gray-700">
                                                날짜
                                            </th>
                                            <th className="py-2 px-4 text-right font-medium text-gray-300 border-b border-gray-700">
                                                {EQUITY_INDICATORS.find(i => i.id === selectedEquityIndicator)?.label}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {prepareEquityTableData().map((row, index) => (
                                            <tr key={row.date} className="hover:bg-gray-700/50 transition-colors">
                                                <td className="py-1.5 px-4 text-gray-300 border-b border-gray-700/50">
                                                    {row.date}
                                                </td>
                                                <td className="py-1.5 px-4 text-right text-gray-300 border-b border-gray-700/50">
                                                    {row.value}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </CardContent>
        </Card>
    );
};

export default GlobalEquityAnalysis;
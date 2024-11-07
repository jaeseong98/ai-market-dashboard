import { Card, CardContent } from '../../../components/Card.js'
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PERIODS = [
    { id: 'daily', label: '전일대비' },
    { id: 'weekly', label: '전주대비' },
    { id: 'monthly', label: '전월대비' },
    { id: 'quarterly', label: '전분기대비' },
    { id: 'yearly', label: '전년대비' }
];

const INDICATORS = [
    { id: 'us.y1', label: '미국 국채 1년', color: '#8884d8' },
    { id: 'us.y3', label: '미국 국채 3년', color: '#82ca9d' },
    { id: 'us.y10', label: '미국 국채 10년', color: '#ffc658' },
    { id: 'us.y30', label: '미국 국채 30년', color: '#ff7300' },
    { id: 'japan.y1', label: '일본 국채 1년', color: '#0088fe' },
    { id: 'japan.y3', label: '일본 국채 3년', color: '#00c49f' },
    { id: 'japan.y10', label: '일본 국채 10년', color: '#ffbb28' },
    { id: 'europe.y1', label: '유럽 국채 1년', color: '#ff8042' },
    { id: 'europe.y3', label: '유럽 국채 3년', color: '#a4de6c' },
    { id: 'europe.y10', label: '유럽 국채 10년', color: '#8dd1e1' },
    { id: 'europe.y30', label: '유럽 국채 30년', color: '#82ca9d' }
];

const GlobalMarketAnalysis = () => {
    const [selectedGlobalPeriod, setSelectedGlobalPeriod] = useState('daily');
    const [selectedEquityPeriod, setSelectedEquityPeriod] = useState('daily');
    const [selectedBondPeriod, setSelectedBondPeriod] = useState('daily');
    const [analysisText, setAnalysisText] = useState({ equity: '', bonds: '' });

    // 드롭다운 메뉴 상태 관리
    const [equityMenuOpen, setEquityMenuOpen] = useState(false);
    const [bondMenuOpen, setBondMenuOpen] = useState(false);
    const equityMenuRef = useRef(null);
    const bondMenuRef = useRef(null);

    // 외부 클릭 시 메뉴 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (equityMenuRef.current && !equityMenuRef.current.contains(event.target)) {
                setEquityMenuOpen(false);
            }
            if (bondMenuRef.current && !bondMenuRef.current.contains(event.target)) {
                setBondMenuOpen(false);
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

        const startIndex = Math.max(0, expandedData.dates.length - 252);
        expandedData.dates = expandedData.dates.slice(startIndex);
        
        Object.keys(expandedData.equity).forEach(key => {
            expandedData.equity[key] = expandedData.equity[key].slice(startIndex);
        });
        
        Object.keys(expandedData.bonds).forEach(country => {
            Object.keys(expandedData.bonds[country]).forEach(term => {
                expandedData.bonds[country][term] = expandedData.bonds[country][term].slice(startIndex);
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

    const formatChange = useCallback((current, previous, type = 'rate') => {
        const diff = current - previous;
        
        if (type === 'bp') {
            const bpDiff = diff * 100;  // bp로 변환
            if (Math.abs(bpDiff) < 0.1) {
                return `${(current * 100).toFixed(2)}% 유지`;
            }
            return `${Math.abs(bpDiff).toFixed(1)}bp ${bpDiff > 0 ? '상승' : '하락'}`;
        }
        
        const percentDiff = diff * 100;  // %로 변환
        if (Math.abs(percentDiff) < 0.01) {
            return `${(current * 100).toFixed(2)}% 유지`;
        }
        return `${Math.abs(percentDiff).toFixed(2)}% ${percentDiff > 0 ? '상승' : '하락'}`;
    }, []);

    const getAnalysisText = useCallback((equityPeriod, bondPeriod) => {
        const equityAnalysis = [
            `[${equityPeriod === 'daily' ? '전일' : 
               equityPeriod === 'weekly' ? '전주' : 
               equityPeriod === 'monthly' ? '전월' : 
               equityPeriod === 'quarterly' ? '전분기' : '전년'} 대비 증감]`,
            `● MSCI ACWI ${formatChange(globalData.equity.msci_acwi[0], globalData.equity.msci_acwi[getIndexByPeriod(equityPeriod)])}, ` +
            `MSCI DM ${formatChange(globalData.equity.msci_dm[0], globalData.equity.msci_dm[getIndexByPeriod(equityPeriod)])}, ` +
            `MSCI EM ${formatChange(globalData.equity.msci_em[0], globalData.equity.msci_em[getIndexByPeriod(equityPeriod)])}, ` +
            `NASDAQ ${formatChange(globalData.equity.nasdaq[0], globalData.equity.nasdaq[getIndexByPeriod(equityPeriod)])}, ` +
            `S&P500 ${formatChange(globalData.equity.sp500[0], globalData.equity.sp500[getIndexByPeriod(equityPeriod)])}, ` +
            `STOXX600 ${formatChange(globalData.equity.stoxx600[0], globalData.equity.stoxx600[getIndexByPeriod(equityPeriod)])}`
        ];

        const bondAnalysis = [
            '[해외 주요국 글로벌 통화정책]',
            `● 미국 기준금리 ${Math.abs(globalData.bonds.us.policy_rate[0] - globalData.bonds.us.policy_rate[getIndexByPeriod(bondPeriod)]) < 0.001 ? 
                `${(globalData.bonds.us.policy_rate[0]).toFixed(2)}% 유지` : 
                `${Math.abs((globalData.bonds.us.policy_rate[0] - globalData.bonds.us.policy_rate[getIndexByPeriod(bondPeriod)]) * 100).toFixed(1)}bp ${globalData.bonds.us.policy_rate[0] > globalData.bonds.us.policy_rate[getIndexByPeriod(bondPeriod)] ? '상승' : '하락'}`}, ` +
            `일본 기준금리 ${Math.abs(globalData.bonds.japan.policy_rate[0] - globalData.bonds.japan.policy_rate[getIndexByPeriod(bondPeriod)]) < 0.001 ? 
                `${(globalData.bonds.japan.policy_rate[0]).toFixed(2)}% 유지` : 
                `${Math.abs((globalData.bonds.japan.policy_rate[0] - globalData.bonds.japan.policy_rate[getIndexByPeriod(bondPeriod)]) * 100).toFixed(1)}bp ${globalData.bonds.japan.policy_rate[0] > globalData.bonds.japan.policy_rate[getIndexByPeriod(bondPeriod)] ? '상승' : '하락'}`}, ` +
            `유럽 중앙은행 기준금리 ${Math.abs(globalData.bonds.europe.policy_rate[0] - globalData.bonds.europe.policy_rate[getIndexByPeriod(bondPeriod)]) < 0.001 ? 
                `${(globalData.bonds.europe.policy_rate[0]).toFixed(2)}% 유지` : 
                `${Math.abs((globalData.bonds.europe.policy_rate[0] - globalData.bonds.europe.policy_rate[getIndexByPeriod(bondPeriod)]) * 100).toFixed(1)}bp ${globalData.bonds.europe.policy_rate[0] > globalData.bonds.europe.policy_rate[getIndexByPeriod(bondPeriod)] ? '상승' : '하락'}`}`,
            `[${bondPeriod === 'daily' ? '전일' : 
               bondPeriod === 'weekly' ? '전주' : 
               bondPeriod === 'monthly' ? '전월' : 
               bondPeriod === 'quarterly' ? '전분기' : '전년'} 대비 증감]`,
            `● 미국 국채 1년 ${formatChange(globalData.bonds.us.y1[0], globalData.bonds.us.y1[getIndexByPeriod(bondPeriod)], 'bp')}, ` +
            `3년 ${formatChange(globalData.bonds.us.y3[0], globalData.bonds.us.y3[getIndexByPeriod(bondPeriod)], 'bp')}, ` +
            `10년 ${formatChange(globalData.bonds.us.y10[0], globalData.bonds.us.y10[getIndexByPeriod(bondPeriod)], 'bp')}, ` +
            `30년 ${formatChange(globalData.bonds.us.y30[0], globalData.bonds.us.y30[getIndexByPeriod(bondPeriod)], 'bp')}`
        ];

        return {
            equity: equityAnalysis.join('\n'),
            bonds: bondAnalysis.join('\n')
        };
    }, [globalData, getIndexByPeriod, formatChange]);

    const formatDate = useCallback((dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear().toString().slice(2);  // 2023 -> 23
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
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
        const newAnalysisText = getAnalysisText(period, selectedBondPeriod);
        setAnalysisText(newAnalysisText);
    }, [getAnalysisText, selectedBondPeriod]);

    const handleBondPeriodChange = useCallback((period) => {
        setSelectedBondPeriod(period);
        const newAnalysisText = getAnalysisText(selectedEquityPeriod, period);
        setAnalysisText(newAnalysisText);
    }, [getAnalysisText, selectedEquityPeriod]);

    const handleGlobalPeriodChange = useCallback((period) => {
        setSelectedGlobalPeriod(period);
        setSelectedEquityPeriod(period);
        setSelectedBondPeriod(period);
        const newAnalysisText = getAnalysisText(period, period);
        setAnalysisText(newAnalysisText);
    }, [getAnalysisText]);

    useEffect(() => {
        const initialAnalysisText = getAnalysisText('daily', 'daily');
        setAnalysisText(initialAnalysisText);
    }, [getAnalysisText]);

    const [selectedIndicator, setSelectedIndicator] = useState('us.y10');
    const [viewMode, setViewMode] = useState('graph');

    // 날짜 포맷팅 함수들을 최상단에 정의
    const formatTooltipDate = useCallback((dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    const formatAxisDate = useCallback((dateString) => {
        const date = new Date(dateString);
        const year = String(date.getFullYear()).slice(2);  // 2024 -> 24
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

    // 채권 그래프 데이터 준비 함수
    const prepareGraphData = useCallback(() => {
        const compareIndex = getIndexByPeriod(selectedBondPeriod);
        const filteredDates = globalData.dates.slice(0, compareIndex + 1);
        
        return filteredDates.map((date, index) => {
            const [country, term] = selectedIndicator.split('.');
            const value = globalData.bonds[country][term][index];
            return {
                date: formatAxisDate(date),
                fullDate: formatTooltipDate(date),
                value: value,
                indicator: INDICATORS.find(i => i.id === selectedIndicator)?.label
            };
        }).reverse();
    }, [globalData, selectedIndicator, selectedBondPeriod, formatAxisDate, formatTooltipDate, getIndexByPeriod]);

    const prepareTableData = useCallback(() => {
        const compareIndex = getIndexByPeriod(selectedBondPeriod);
        const filteredDates = globalData.dates.slice(0, compareIndex + 1);
        
        return filteredDates.map((date, index) => {
            const [country, term] = selectedIndicator.split('.');
            const value = globalData.bonds[country][term][index];
            return {
                date: formatFullDate(date),
                value: value.toFixed(2)
            };
        });
    }, [globalData, selectedIndicator, selectedBondPeriod, formatFullDate, getIndexByPeriod]);

    // 상태 추가
    const [selectedEquityIndicator, setSelectedEquityIndicator] = useState('msci_acwi');
    const [equityViewMode, setEquityViewMode] = useState('graph');

    // EQUITY_INDICATORS를 useMemo로 감싸기
    const EQUITY_INDICATORS = useMemo(() => [
        { id: 'msci_acwi', label: 'MSCI ACWI', color: '#8884d8' },
        { id: 'msci_dm', label: 'MSCI DM', color: '#82ca9d' },
        { id: 'msci_em', label: 'MSCI EM', color: '#ffc658' },
        { id: 'nasdaq', label: 'NASDAQ', color: '#ff7300' },
        { id: 'sp500', label: 'S&P500', color: '#0088fe' },
        { id: 'stoxx600', label: 'STOXX600', color: '#00c49f' }
    ], []); // 빈 의존성 배열: 배열이 변경될 일이 없으므로

    // 그래프 데이터 준비 함수 수정
    const prepareEquityGraphData = useCallback(() => {
        const compareIndex = getIndexByPeriod(selectedEquityPeriod);
        const filteredDates = globalData.dates.slice(0, compareIndex + 1);
        
        return filteredDates.map((date, index) => {
            const value = globalData.equity[selectedEquityIndicator][index];
            
            return {
                date: formatAxisDate(date),
                fullDate: formatTooltipDate(date),
                value: value * 100, // 퍼센트로 변환
                indicator: EQUITY_INDICATORS.find(i => i.id === selectedEquityIndicator)?.label
            };
        }).reverse();
    }, [
        globalData, 
        selectedEquityIndicator, 
        selectedEquityPeriod, 
        formatAxisDate, 
        formatTooltipDate,
        getIndexByPeriod,
        EQUITY_INDICATORS
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
    }, [globalData, selectedEquityIndicator, selectedEquityPeriod, formatFullDate, getIndexByPeriod]);

    return (
        <Card className="bg-gray-800 text-white w-[calc(33.333%-1rem)]">
            <CardContent className="p-4">
                <h3 className="text-xl font-semibold mb-4 flex items-center border-b border-gray-700 pb-3">
                    <span className="mr-2" role="img" aria-label="globe">🌎</span>
                    <span className="text-blue-200">해외 채권시장</span>
                </h3>

                <div className="mb-6 flex items-center gap-4">
                    <div className="relative inline-block">
                        <select
                            onChange={(e) => handleGlobalPeriodChange(e.target.value)}
                            value={selectedGlobalPeriod}
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
                        ({getDateRange(selectedGlobalPeriod).compare} ~ {getDateRange(selectedGlobalPeriod).current})
                    </span>
                </div>

                <div className="space-y-2">
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

                    {/* <section className="bg-gray-900/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="relative" ref={equityMenuRef}>
                                <button 
                                    onClick={() => setEquityMenuOpen(!equityMenuOpen)}
                                    className="flex items-center gap-2 font-medium text-yellow-300 hover:text-yellow-200 transition-colors duration-200"
                                >
                                    <span className="w-2 h-2 bg-yellow-300 rounded-full"></span>
                                    해외 주식
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button> */}
                                
                                {/* 주식 드롭다운 메뉴 */}
                                {/* {equityMenuOpen && (
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
                                    </div> */}
                                {/* )}
                            </div>
                            <span className="text-sm text-gray-400">
                                ({getDateRange(selectedEquityPeriod).compare} ~ {getDateRange(selectedEquityPeriod).current})
                            </span>
                        </div>
                        <p className="leading-relaxed text-gray-200 text-sm whitespace-pre-line mb-4">
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
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setEquityViewMode('graph')}
                                    className={`px-3 py-1.5 rounded-md ${
                                        equityViewMode === 'graph' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    그래프
                                </button>
                                <button
                                    onClick={() => setEquityViewMode('table')}
                                    className={`px-3 py-1.5 rounded-md ${
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
                                    <LineChart data={prepareEquityGraphData()} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
                    </section> */}

                    <section className="bg-gray-900/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="relative" ref={bondMenuRef}>
                                <button 
                                    onClick={() => setBondMenuOpen(!bondMenuOpen)}
                                    className="flex items-center gap-2 font-medium text-blue-300 hover:text-blue-200 transition-colors duration-200"
                                >
                                    <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                                    해외 채권
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {/* 채권 드롭다운 메뉴 */}
                                {bondMenuOpen && (
                                    <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5">
                                        <div className="py-1">
                                            {PERIODS.map(period => (
                                                <button
                                                    key={period.id}
                                                    onClick={() => {
                                                        handleBondPeriodChange(period.id);
                                                        setBondMenuOpen(false);
                                                    }}
                                                    className={`block w-full text-left px-4 py-2 text-sm ${
                                                        selectedBondPeriod === period.id 
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
                                ({getDateRange(selectedBondPeriod).compare} ~ {getDateRange(selectedBondPeriod).current})
                            </span>
                        </div>
                        <p className="leading-relaxed text-gray-200 text-sm whitespace-pre-line mb-4">
                            {analysisText.bonds}
                        </p>

                        {/* 지표 선택 및 그래프/테이블 토글 */}
                        <div className="flex items-center gap-4 mb-4">
                            <select
                                value={selectedIndicator}
                                onChange={(e) => setSelectedIndicator(e.target.value)}
                                className="appearance-none bg-gray-700 text-white text-sm px-3 py-1.5 pr-8 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:bg-gray-600 transition-colors duration-200"
                            >
                                {INDICATORS.map(indicator => (
                                    <option key={indicator.id} value={indicator.id}>
                                        {indicator.label}
                                    </option>
                                ))}
                            </select>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setViewMode('graph')}
                                    className={`px-3 py-1.5 rounded-md ${
                                        viewMode === 'graph' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    그래프
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`px-3 py-1.5 rounded-md ${
                                        viewMode === 'table' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    테이블
                                </button>
                                <span className="text-sm text-gray-400 ml-2">
                                    ({getDateRange(selectedBondPeriod).compare} ~ {getDateRange(selectedBondPeriod).current})
                                </span>
                            </div>
                        </div>

                        {/* 그래프/테이블 뷰 */}
                        {viewMode === 'graph' ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={prepareGraphData()} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
                                                `${props.payload.indicator} ${value.toFixed(2)}`
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
                                            stroke={INDICATORS.find(i => i.id === selectedIndicator)?.color} 
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
                                                {INDICATORS.find(i => i.id === selectedIndicator)?.label}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {prepareTableData().map((row, index) => (
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

export default GlobalMarketAnalysis; 
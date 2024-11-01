import { Card, CardHeader, CardContent } from '../../../components/Card.js'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import CustomTooltip from '../../../components/CustomTooltip.js'
import FinancialRates from './FinancialRates.js'

// 상수들을 파일 상단으로 이동
const MAIN_INDICES = ['IXIC', 'US500', 'KS11', 'KQ11'];
const OTHER_INDICES = ['KS200', 'DJI', 'VIX', 'SSEC', 'HSI', 'N225'];

// 지수 정보 매핑
const INDEX_INFO = {
    'KS11': { name: 'KOSPI', korName: '코스피', country: '한국', color: '#E74C3C' },
    'KQ11': { name: 'KOSDAQ', korName: '코스', country: '한국', color: '#2ECC71' },
    'KS200': { name: 'KOSPI200', korName: '코스피200', country: '한국', color: '#3498DB' },
    'DJI': { name: 'Dow Jones', korName: '다우존스', country: '미국', color: '#9B59B6' },
    'IXIC': { name: 'NASDAQ', korName: '나스닥', country: '미국', color: '#F1C40F' },
    'US500': { name: 'S&P500', korName: 'S&P500', country: '미국', color: '#E67E22' },
    'VIX': { name: 'VIX', korName: 'VIX', country: '미국', color: '#1ABC9C' },
    'SSEC': { name: 'Shanghai', korName: '상해종합', country: '중국', color: '#34495E' },
    'HSI': { name: 'Hang Seng', korName: '항셍', country: '홍콩', color: '#7F8C8D' },
    'N225': { name: 'Nikkei 225', korName: '니케이225', country: '일본', color: '#C0392B' }
};

// 천 단위 구분자를 적용하는 함수
const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    }).format(value);
}

const MarketChart = ({ marketIndices, exchangeRates, commodityRates }) => {
    console.log('MarketChart - Raw marketIndices:', marketIndices);
    
    // 데이터 구조 상세 검증
    const validationResults = {
        hasMarketIndices: !!marketIndices,
        hasData: !!marketIndices?.data,
        isArray: Array.isArray(marketIndices?.data),
        dataLength: marketIndices?.data?.length,
        sampleData: marketIndices?.data?.[0]
    };
    console.log('MarketChart - Validation Results:', validationResults);

    if (!marketIndices || !marketIndices.data || !Array.isArray(marketIndices.data)) {
        console.log('Invalid market indices data');
        return <Card className="p-4">시장 데이터가 없습니다</Card>
    }

    const getIndexData = (indexCode) => {
        return [...marketIndices.data]
            .filter(item => item.index_code === indexCode)
            .sort((a, b) => new Date(a.trading_date) - new Date(b.trading_date))
            .slice(-100);
    }

    const renderChart = (indexCode) => {
        const indexData = getIndexData(indexCode);
        if (indexData.length === 0) return null;

        const latestData = getLatestData(indexCode);
        if (!latestData) return null;

        const indexInfo = INDEX_INFO[indexCode];
        const gradientId = `gradient${indexCode}`;
        const isPositive = latestData.change_rate >= 0;
        const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
        const changeIcon = isPositive ? '▲' : '▼';

        return (
            <Card className="flex-1">
                <CardHeader className="pb">
                    <div className="flex justify-between items-baseline">
                        <span className="text-gray-400 text-sm">{indexInfo.name}</span>
                        <div className="text-right">
                            <div className="text-lg font-bold">
                                {formatNumber(latestData.closing_price)}
                            </div>
                            <div className={`flex items-center justify-end space-x-2 ${changeColor} text-xs`}>
                                <span>{changeIcon} {isNaN(latestData.price_change) ? 'NaN' : formatNumber(Math.abs(latestData.price_change))}</span>
                                <span>{isNaN(latestData.change_rate) ? 'NaN' : formatNumber(latestData.change_rate)}%</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="h-[170px]">
                        <ResponsiveContainer width="125%" height="100%">
                            <AreaChart 
                                data={indexData}
                                margin={{ top: 5, right: 35, left: -15, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={indexInfo.color} stopOpacity={0.3} />
                                        <stop offset="100%" stopColor={indexInfo.color} stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="trading_date" 
                                    stroke="#A0AEC0" 
                                    tick={{fontSize: 10}}
                                    tickFormatter={(date) => {
                                        const d = new Date(date);
                                        return `${d.getMonth() + 1}/${d.getDate()}`;
                                    }}
                                    interval={Math.ceil(indexData.length / 6)}
                                    dy={10}
                                    
                                />
                                <YAxis
                                    stroke="#A0AEC0"
                                    tick={{fontSize: 10}}
                                    domain={['auto', 'auto']}
                                    tickFormatter={(value) => new Intl.NumberFormat('en-US').format(value)} // 천단위 구분자 추가
                                    orientation="right"
                                    dx={5}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="closing_price"
                                    stroke={indexInfo.color}
                                    strokeWidth={1.5}
                                    fillOpacity={1}
                                    fill={`url(#${gradientId})`}
                                    name="Price" // closing_price를 "가격"으로 변경
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const renderTable = () => {
        return (
            <Card>
                <CardContent className="p-2">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-gray-400 text-xs">
                                    <th className="text-left py-0.5">국가</th>
                                    <th className="text-left py-0.5">지수명</th>
                                    <th className="text-right py-0.5">종가</th>
                                    <th className="text-right py-0.5">전일대비</th>
                                    <th className="text-right py-0.5">등락률</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs">
                                {OTHER_INDICES.map(indexCode => {
                                    const latestData = getLatestData(indexCode);
                                    if (!latestData) return null;

                                    const isPositive = latestData.change_rate >= 0;
                                    const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
                                    const changeIcon = isPositive ? '▲' : '▼';

                                    return (
                                        <tr key={indexCode} className="border-t border-gray-800/30">
                                            <td className="py-0.5 text-left text-blue-400/80">
                                                {INDEX_INFO[indexCode].country}
                                            </td>
                                            <td className="py-0.5 text-left">
                                                <span>{INDEX_INFO[indexCode].korName}</span>
                                                <span className="text-gray-500 ml-1">({INDEX_INFO[indexCode].name})</span>
                                            </td>
                                            <td className="py-0.5 text-right">
                                                {formatNumber(latestData.closing_price)}
                                            </td>
                                            <td className={`py-0.5 text-right ${changeColor}`}>
                                                {changeIcon} {formatNumber(Math.abs(latestData.price_change))}
                                            </td>
                                            <td className={`py-0.5 text-right ${changeColor}`}>
                                                {formatNumber(latestData.change_rate)}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        );
    };

    // getLatestData 함수 수정
    const getLatestData = (indexCode) => {
        const indexData = getIndexData(indexCode);
        if (indexData.length < 2) return null;

        const latestData = indexData[indexData.length - 1];
        const previousData = indexData[indexData.length - 2];

        // 전일대비 변화량 계산
        const price_change = latestData.closing_price - previousData.closing_price;
        const change_rate = ((price_change / previousData.closing_price) * 100);

        return {
            ...latestData,
            price_change: price_change,
            change_rate: change_rate
        };
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
                {MAIN_INDICES.map(indexCode => renderChart(indexCode))}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    {renderTable()}
                </div>
                <div>
                    {exchangeRates && commodityRates && (
                        <FinancialRates 
                            exchangeRates={exchangeRates} 
                            commodityRates={commodityRates} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default MarketChart

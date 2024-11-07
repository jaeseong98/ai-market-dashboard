import { Card, CardContent } from '../../../components/Card.js'
import { useState, useEffect, useMemo, useCallback } from 'react'
import GlobalBondAnalysis from './GlobalBondAnalysis.js'

const EconomicAnalysis = () => {
    const [analysis, setAnalysis] = useState({
        treasuryMarket: '',
        moneyMarket: '',
        creditMarket: ''
    });

    // 전체 데이터 구조 정의
    const bondData = useMemo(() => ({
        dates: ['2023-10-02', '2023-10-03', '2023-10-04', '2023-10-05', '2023-10-06', '2023-10-07'],
        rates: {
            call: [0.03829, 0.03829, 0.03555, 0.03527, 0.03502, 0.03502],
            cd: [0.0383, 0.0383, 0.0384, 0.0383, 0.0382, 0.0382],
            cp: [0.0404, 0.0404, 0.0405, 0.0405, 0.0406, 0.0406],
            msp_91: [0.03629, 0.03629, 0.03657, 0.03642, 0.03642, 0.03642],
            base: [0.035, 0.035, 0.035, 0.035, 0.035, 0.035],
            treasury: {
                y1: [0.03677, 0.03677, 0.03757, 0.0374, 0.03737, 0.03737],
                y3: [0.03875, 0.03875, 0.0414, 0.04085, 0.04011, 0.04011],
                y5: [0.03925, 0.03925, 0.04231, 0.04187, 0.0441, 0.0441],
                y10: [0.04012, 0.04012, 0.04385, 0.04335, 0.04244, 0.04244],
                y30: [0.03882, 0.03882, 0.04249, 0.0422, 0.04136, 0.04136]
            },
            spread: [13.7, 13.7, 24.5, 25, 23.3, 23.3],
            credit_3y: [0.0465, 0.0465, 0.0492, 0.0487, 0.0479, 0.0479]
        }
    }), []);

    // 유틸리티 함수들
    const utils = useMemo(() => ({
        getChange: (current, previous) => ((current - previous) * 100).toFixed(1),
        formatRate: (rate) => (rate * 100).toFixed(2),
        getLatestValue: (arr) => arr[arr.length - 1],
        getPreviousValue: (arr) => arr[arr.length - 2]
    }), []);

    // 1. 기본 유틸리티 함수들
    const calculateVolatility = useCallback((rates) => {
        const changes = [];
        for (let i = 1; i < rates.length; i++) {
            changes.push(Math.abs(rates[i] - rates[i-1]));
        }
        return changes.reduce((a, b) => a + b, 0) / changes.length;
    }, []);

    const getVolatilityReason = useCallback((govtVol, creditVol) => {
        if (govtVol > creditVol * 1.5) {
            return '금리 정책 및 경기 전망 관련 불확실성이 높음을 시사합니다.';
        } else if (creditVol > govtVol * 1.5) {
            return '신용리스크에 대한 민감도가 높아진 것으로 판단됩니다.';
        }
        return '전반적으로 안정적인 시장 흐름이 지속되고 있음을 보여줍니다.';
    }, []);

    // 2. 수익률 곡선 분석 함수들
    const getYieldCurveAnalysis = useCallback((y1, y3, y5, y10, y30) => {
        const shortEnd = (y3[y3.length-1] - y1[y1.length-1]) * 100;
        const belly = (y5[y5.length-1] - y3[y3.length-1]) * 100;
        const longEnd = (y10[y10.length-1] - y5[y5.length-1]) * 100;
        
        let analysis = '';
        if (Math.abs(shortEnd) > Math.abs(longEnd)) {
            analysis = `단기구간 중심으로 변동성이 확대되는 모습이며, 커브 기울기는 ${shortEnd > 0 ? '가파르게' : '완만하게'} 형성`;
        } else {
            analysis = `장기구간 위주로 금리 변동이 나타나며, 커브는 ${longEnd > 20 ? '가파른' : '완만한'} 기울기를 보이는`;
        }

        const curveShape = belly > shortEnd && belly > longEnd 
            ? '볼록한(humped) 형태를'
            : shortEnd < 0 && longEnd < 0 
                ? '역전된 형태를' 
                : '정상적인 형태를';

        return `${analysis}되어 있고, ${curveShape} 나타내고 있습니다.`;
    }, []);

    const getSegmentAnalysis = useCallback((y1, y3, y5, y10, y30) => {
        const changes = [
            { term: '1년물', change: Math.abs(y1[y1.length-1] - y1[y1.length-2]) },
            { term: '3년물', change: Math.abs(y3[y3.length-1] - y3[y3.length-2]) },
            { term: '5년물', change: Math.abs(y5[y5.length-1] - y5[y5.length-2]) },
            { term: '10년물', change: Math.abs(y10[y10.length-1] - y10[y10.length-2]) },
            { term: '30년물', change: Math.abs(y30[y30.length-1] - y30[y30.length-2]) }
        ];
        
        const maxChange = changes.reduce((max, current) => 
            current.change > max.change ? current : max
        );
        
        return maxChange.term;
    }, []);

    const getTermSpreadAnalysis = useCallback((spread) => {
        if (spread < 0) {
            return '수익률 곡선 역전 현상이 지속되며 경기 둔화 우려';
        } else if (spread < 50) {
            return '완만한 수익률 곡선이 유지되며 안정적인 시장 상황';
        } else if (spread < 100) {
            return '정상적인 우상향 수익률 곡선이 유지되는 상황';
        }
        return '가파른 수익률 곡선이 형성되며 경기 회복 기대감';
    }, []);

    // 3. 신용시장 분석 함수들
    const getInvestmentSentiment = useCallback((creditSpread, termSpread) => {
        if (creditSpread > 80 && termSpread < 30) {
            return '위험회피 심리가 강화되는 모습입니다.';
        } else if (creditSpread < 60 && termSpread > 50) {
            return '위험선호 심리가 확대되는 모습입니다.';
        }
        return '중립적인 투자심리를 보이고 있습니다.';
    }, []);

    const getCreditMarketTrend = useCallback((credit_3y, y3) => {
        const creditChange = credit_3y[credit_3y.length-1] - credit_3y[credit_3y.length-2];
        const govtChange = y3[y3.length-1] - y3[y3.length-2];
        const spreadChange = (creditChange - govtChange) * 100;
        
        if (Math.abs(spreadChange) < 0.5) {
            return '스프레드는 안정적인 흐름을 보이고 있으며';
        }
        return `스프레드는 전일대비 ${Math.abs(spreadChange).toFixed(1)}bp ${spreadChange > 0 ? '확대' : '축소'}되었으며`;
    }, []);

    // 4. 시장 동향 분석 함수들
    const getMoneyMarketStatus = useCallback((cd, cp) => {
        const cdChange = cd[cd.length-1] - cd[cd.length-2];
        const cpChange = cp[cp.length-1] - cp[cp.length-2];
        
        if (cdChange > 0 && cpChange > 0) {
            return '전반적인 상승세를 보이는';
        } else if (cdChange < 0 && cpChange < 0) {
            return '전반적인 하락세를 보이는';
        }
        return '혼조세를 보이는';
    }, []);

    const getLiquidityStatus = useCallback((call, base, cd, cp) => {
        const baseSpread = call[call.length-1] - base[base.length-1];
        const cdcpSpread = cp[cp.length-1] - cd[cd.length-1];
        
        if (baseSpread < -0.001 && cdcpSpread < 0.001) {
            return '유동성이 풍부';
        } else if (baseSpread > 0.001 && cdcpSpread > 0.002) {
            return '유동성이 다소 타이트';
        }
        return '유동성이 중립적';
    }, []);

    // 2. 신용시장 상태 분석
    const getCreditMarketStatus = useCallback((spread) => {
        if (spread > 100) return '신용경계감이 높은 수준';
        if (spread > 80) return '투자심리가 다소 위축된 상황';
        if (spread > 60) return '보통 수준의 신용위험 선호도';
        return '양호한 투자심리';
    }, []);

    // 3. 수급 분석 함수들
    const getRecentTrend = useCallback((rates) => {
        const recentChanges = rates.slice(-3);
        const trend = recentChanges.reduce((acc, curr, idx) => {
            if (idx === 0) return 0;
            return acc + (curr - recentChanges[idx-1]);
        }, 0);
        
        if (Math.abs(trend) < 0.0001) return '보합';
        return trend > 0 ? '매도우위' : '매수우위';
    }, []);

    const getSupplyDemandConclusion = useCallback((govtTrend, creditTrend) => {
        if (govtTrend === creditTrend) {
            return '전반적으로 동조화된 흐름이 나타나고 있습니다.';
        } else if (govtTrend === '매수우위' && creditTrend === '매도우위') {
            return '안전자산 선호 현상이 두드러지고 있습니다.';
        }
        return '위험자산 선호 심리가 확대되고 있습니다.';
    }, []);

    const getSupplyDemandAnalysis = useCallback((y3, credit_3y) => {
        const govtTrend = getRecentTrend(y3);
        const creditTrend = getRecentTrend(credit_3y);
        
        return `국고채는 ${govtTrend} 흐름을, 크레딧 섹터는 ${creditTrend} 양상을 보이며, ${getSupplyDemandConclusion(govtTrend, creditTrend)}`;
    }, [getRecentTrend, getSupplyDemandConclusion]);

    const getVolatilityAnalysis = useCallback((y3, credit_3y) => {
        const y3Volatility = calculateVolatility(y3);
        const creditVolatility = calculateVolatility(credit_3y);
        
        return `시장 변동성은 ${y3Volatility > creditVolatility ? '국고채' : '크레딧'} 섹터에서 더 높게 나타나고 있으며, 이는 ${getVolatilityReason(y3Volatility, creditVolatility)}`;
    }, [calculateVolatility, getVolatilityReason]);

    useEffect(() => {
        const {
            treasury: { y1, y3, y5, y10, y30 },
            call, cd, cp, base, credit_3y
        } = bondData.rates;

        // 주요 지표 변화 계산
        const y3Change = utils.getChange(y3[y3.length-1], y3[y3.length-2]);
        const creditSpread = ((credit_3y[credit_3y.length-1] - y3[y3.length-1]) * 100).toFixed(1);
        const termSpread = (y10[y10.length-1] - y3[y3.length-1]) * 100;
        const baseCallSpread = (call[call.length-1] - base[base.length-1]) * 100;

        setAnalysis({
            overview: [
                `국고채 3년물 금리는 전일대비 ${Math.abs(y3Change)}bp ${y3Change > 0 ? '상승' : '하락'}한 ${utils.formatRate(y3[y3.length-1])}%에 마감했습니다.`,
                getYieldCurveAnalysis(y1, y3, y5, y10, y30),
                `신용스프레드는 ${creditSpread}bp로, ${getCreditMarketStatus(creditSpread)}입니다.`
            ].join(' '),

            treasuryMarket: [
                `수익률 곡선은 국고채 1년물 ${utils.formatRate(y1[y1.length-1])}%, 3년물 ${utils.formatRate(y3[y3.length-1])}%, 5년물 ${utils.formatRate(y5[y5.length-1])}%, 10년물 ${utils.formatRate(y10[y10.length-1])}%로 형성되어 있으며,`,
                `장단기 스프레드(10년-3년)는 ${termSpread.toFixed(1)}bp로 ${getTermSpreadAnalysis(termSpread)}을 시사합니다.`,
                `특히 ${getSegmentAnalysis(y1, y3, y5, y10, y30)} 구간의 움직임이 두드러졌습니다.`
            ].join(' '),

            moneyMarket: [
                `콜금리는 ${utils.formatRate(call[call.length-1])}%로 기준금리 대비 ${Math.abs(baseCallSpread).toFixed(1)}bp ${baseCallSpread > 0 ? '높은' : '낮은'} 수준을 보이고 있으며,`,
                `CD금리(${utils.formatRate(cd[cd.length-1])}%)와 CP금리(${utils.formatRate(cp[cp.length-1])}%)는 ${getMoneyMarketStatus(cd, cp)} 모습입니다.`,
                `전반적인 단기자금시장은 ${getLiquidityStatus(call, base, cd, cp)}한 상황입니다.`
            ].join(' '),

            creditMarket: [
                `회사채(AA-) 금리는 ${utils.formatRate(credit_3y[credit_3y.length-1])}%로 국고채 대비 ${creditSpread}bp의 스프레드를 보이고 있으며,`,
                getCreditMarketTrend(credit_3y, y3),
                `전반적인 신용시장은 ${getInvestmentSentiment(creditSpread, termSpread)}`,
                getVolatilityAnalysis(y3, credit_3y),
                getSupplyDemandAnalysis(y3, credit_3y)
            ].join(' ')
        });
    }, [
        bondData, 
        utils,
        getYieldCurveAnalysis,
        getCreditMarketStatus,
        getTermSpreadAnalysis,
        getSegmentAnalysis,
        getMoneyMarketStatus,
        getLiquidityStatus,
        getCreditMarketTrend,
        getInvestmentSentiment,
        getVolatilityAnalysis,
        getSupplyDemandAnalysis
    ]);

    return (
        <div className="flex gap-4 w-full">
            <Card className="bg-gray-800 text-white w-1/2">
                <CardContent className="p-4">
                    <h3 className="text-xl font-semibold mb-6 flex items-center border-b border-gray-700 pb-3">
                        <span className="mr-2" role="img" aria-label="chart">💡</span>
                        <span className="text-blue-200">국내 채권 시장</span>
                    </h3>
                    
                    <div className="space-y-6">
                        <section className="bg-gray-900/50 rounded-lg p-4">
                            <h4 className="font-medium text-yellow-300 mb-2 flex items-center">
                                <span className="w-2 h-2 bg-yellow-300 rounded-full mr-2"></span>
                                종합 시장 동향
                            </h4>
                            <p className="leading-relaxed text-gray-200 text-sm">
                                {analysis.overview}
                            </p>
                        </section>
                        
                        <section className="bg-gray-900/50 rounded-lg p-4">
                            <h4 className="font-medium text-orange-300 mb-2 flex items-center">
                                <span className="w-2 h-2 bg-orange-300 rounded-full mr-2"></span>
                                국고채 시장 동향
                            </h4>
                            <p className="leading-relaxed text-gray-200 text-sm">
                                {analysis.treasuryMarket}
                            </p>
                        </section>
                        
                        <section className="bg-gray-900/50 rounded-lg p-4">
                            <h4 className="font-medium text-blue-300 mb-2 flex items-center">
                                <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                                단기금융시장 동향
                            </h4>
                            <p className="leading-relaxed text-gray-200 text-sm">
                                {analysis.moneyMarket}
                            </p>
                        </section>

                        <section className="bg-gray-900/50 rounded-lg p-4">
                            <h4 className="font-medium text-green-300 mb-2 flex items-center">
                                <span className="w-2 h-2 bg-green-300 rounded-full mr-2"></span>
                                신용채권시장 동향
                            </h4>
                            <p className="leading-relaxed text-gray-200 text-sm">
                                {analysis.creditMarket}
                            </p>
                        </section>
                    </div>
                </CardContent>
            </Card>
            
            <GlobalBondAnalysis />
        </div>
    );
};

export default EconomicAnalysis;

import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardContent } from '../../../components/Card.js'
import { formatValue } from '../../../helpers/dataprocessing.js'

const categories = ['환율', '원자재', '금속', '농산물']

const FinancialRates = ({ exchangeRates, commodityRates }) => {
    const [activeCategory, setActiveCategory] = useState('환율')

    const data = useMemo(() => {
        if (!exchangeRates || !commodityRates) {
            return {
                환율: [],
                원자재: [],
                금속: [],
                농산물: []
            };
        }

        return {
            환율: [
                { name: '원/달러', rate: exchangeRates.usd_krw, change: exchangeRates.usd_krw_change, changePercent: exchangeRates.usd_krw_change_pct },
                { name: '엔/달러', rate: exchangeRates.usd_jpy, change: exchangeRates.usd_jpy_change, changePercent: exchangeRates.usd_jpy_change_pct },
                { name: '달러/유로', rate: exchangeRates.eur_usd, change: exchangeRates.eur_usd_change, changePercent: exchangeRates.eur_usd_change_pct },
                { name: '홍콩달러/달러', rate: exchangeRates.usd_hkd, change: exchangeRates.usd_hkd_change, changePercent: exchangeRates.usd_hkd_change_pct },
            ],
            원자재: [
                { name: 'WTI유', rate: commodityRates.wti_crude, change: commodityRates.wti_crude_change, changePercent: commodityRates.wti_crude_change_pct },
                { name: '두바이유', rate: commodityRates.dubai_crude, change: commodityRates.dubai_crude_change, changePercent: commodityRates.dubai_crude_change_pct },
                { name: '브렌트유', rate: commodityRates.brent_crude, change: commodityRates.brent_crude_change, changePercent: commodityRates.brent_crude_change_pct },
                { name: '천연가스', rate: commodityRates.natural_gas, change: commodityRates.natural_gas_change, changePercent: commodityRates.natural_gas_change_pct },
            ],
            금속: [
                { name: '금', rate: commodityRates.gold, change: commodityRates.gold_change, changePercent: commodityRates.gold_change_pct },
                { name: '구리', rate: commodityRates.copper, change: commodityRates.copper_change, changePercent: commodityRates.copper_change_pct },
                { name: '니켈', rate: commodityRates.nickel, change: commodityRates.nickel_change, changePercent: commodityRates.nickel_change_pct },
                { name: '철광석', rate: commodityRates.iron_ore, change: commodityRates.iron_ore_change, changePercent: commodityRates.iron_ore_change_pct },
            ],
            농산물: [
                { name: '대두', rate: commodityRates.soybean, change: commodityRates.soybean_change, changePercent: commodityRates.soybean_change_pct },
                { name: '옥수수', rate: commodityRates.corn, change: commodityRates.corn_change, changePercent: commodityRates.corn_change_pct },
                { name: '밀', rate: commodityRates.wheat, change: commodityRates.wheat_change, changePercent: commodityRates.wheat_change_pct },
                { name: '설탕', rate: commodityRates.sugar, change: commodityRates.sugar_change, changePercent: commodityRates.sugar_change_pct },
            ],
        };
    }, [exchangeRates, commodityRates]);

    if (!exchangeRates || !commodityRates) {
        return (
            <Card className="h-full">
                <CardContent className="p-2">
                    <div className="text-center text-gray-400 text-xs">
                        Loading...
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-[196px]"> {/* 전체 높이 줄임 */}
            <CardHeader className="p-1">
                <div className="flex space-x-1">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-2 py-0.5 text-xs rounded ${
                                activeCategory === category ? 'bg-blue-600' : 'bg-gray-700'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="p-1">
                <table className="w-full">
                    <thead>
                        <tr className="text-gray-400 text-xs">
                            <th className="text-left py-0.5">구분</th>
                            <th className="text-right py-0.5">가격</th>
                            <th className="text-right py-0.5">전일대비</th>
                            <th className="text-right py-0.5">등락률</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs">
                        {data[activeCategory].map((item, index) => (
                            <tr key={index} className="border-t border-gray-800/30">
                                <td className="py-0.5 text-left">{item.name}</td>
                                <td className="py-0.5 text-right">
                                    {formatValue(item.rate, true)}
                                </td>
                                <td className={`py-0.5 text-right ${
                                    item.change >= 0 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                    {item.change >= 0 ? '▲' : '▼'} {formatValue(Math.abs(item.change), true)}
                                </td>
                                <td className={`py-0.5 text-right ${
                                    item.change >= 0 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                    {formatValue(Math.abs(item.changePercent), true)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    )
}

export default FinancialRates

import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardContent } from '../../../components/Card.js'
import { formatValue } from '../../../helpers/dataprocessing.js'

const categories = ['환율', '원자재', '금속', '농산물']

const FinancialRates = ({ exchangeRates, commodityRates }) => {
    const [activeCategory, setActiveCategory] = useState('환율')

    const data = useMemo(() => {
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

    const renderCell = (item, key) => {
        if (!item) return <td className="py-3 text-center">-</td>

        let value, color
        switch (key) {
            case 'name':
                return <td className="py-3 text-center w-1/4 truncate text-sm">{item.name}</td>
            case 'rate':
                value = formatValue(item.rate, true)
                color = item.change >= 0 ? 'text-red-400' : 'text-blue-400'
                return (
                    <td className={`py-3 text-center w-1/4 truncate ${color} text-sm`}>
                        {item.change >= 0 ? '▲' : '▼'} {value}
                    </td>
                )
            case 'change':
                value = formatValue(Math.abs(item.change), true)
                color = item.change >= 0 ? 'text-red-400' : 'text-blue-400'
                return (
                    <td className={`py-3 text-center w-1/4 truncate ${color} text-sm`}>
                        {item.change >= 0 ? '▲' : '▼'} {value}
                    </td>
                )
            case 'changePercent':
                value = formatValue(item.changePercent, true)
                color = item.change >= 0 ? 'text-red-400' : 'text-blue-400'
                return <td className={`py-3 text-center w-1/4 truncate ${color} text-sm`}>{value}%</td>
            default:
                return <td className="py-3 text-center w-1/4 text-sm">-</td>
        }
    }

    const renderTableRows = () => {
        const rows = []
        for (let i = 0; i < 4; i++) {
            rows.push(
                <tr key={i} className="border-t border-gray-700">
                    {renderCell(data[activeCategory][i], 'name')}
                    {renderCell(data[activeCategory][i], 'rate')}
                    {renderCell(data[activeCategory][i], 'change')}
                    {renderCell(data[activeCategory][i], 'changePercent')}
                </tr>,
            )
        }
        return rows
    }

    const getComparisonText = () => {
        return activeCategory === '환율' ? '전일대비' : '전월대비'
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex justify-between items-center py-3">
                <div className="flex space-x-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-3 py-1 text-sm rounded ${
                                activeCategory === category ? 'bg-blue-600' : 'bg-gray-700'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <span className="text-sm text-gray-400">USD 기준</span>
            </CardHeader>
            <CardContent className="flex-grow py-1">
                <table className="w-full table-fixed">
                    <thead>
                        <tr className="text-gray-300">
                            <th className="pb-2 text-center w-1/4 text-sm">구분</th>
                            <th className="pb-2 text-center w-1/4 text-sm">환율</th>
                            <th className="pb-2 text-center w-1/4 text-sm">{getComparisonText()}</th>
                            <th className="pb-2 text-center w-1/4 text-sm">등락률</th>
                        </tr>
                    </thead>
                    <tbody>{renderTableRows()}</tbody>
                </table>
            </CardContent>
        </Card>
    )
}

export default FinancialRates

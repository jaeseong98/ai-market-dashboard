import { Card, CardContent } from '../../../components/Card.js'

const MarketInsights = () => {
    return (
        <Card className="bg-gray-900 text-white">
            <CardContent className="p">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="mr-2" role="img" aria-label="insights">💡</span>시장 분석
                </h3>
                <div className="space-y-4 text-sm">
                    <section>
                        <h4 className="font-semibold text-blue-300 mb-2">시장 동향</h4>
                        <p>오늘 미국 시장은 소폭 하락세로 출발할 것으로 예상됩니다. S&P 500과 NASDAQ 모두 전일 대비 하락세를 보이고 있어, 투자자들의 신중한 태도가 반영된 것으로 보입니다. 최근 상승세 이후 약간의 조정 국면에 진입한 것으로 판단되며, 단기 과열에 대한 우려와 함께 향후 경제 지표 및 기업 실적에 대한 기대감이 혼재된 결과로 볼 수 있습니다.</p>
                    </section>
                    
                    <section>
                        <h4 className="font-semibold text-green-300 mb-2">환율 동향</h4>
                        <p>환율 측면에서는 원/달러 환율이 소폭 상승하여 원화 약세를 보이는 반면, 엔/달러 환율은 하락하여 엔화 강세를 나타내고 있습니다. 글로벌 경제 불확실성과 각국의 통화 정책 차이가 반영된 것으로 해석됩니다.</p>
                    </section>
                    
                    <section>
                        <h4 className="font-semibold text-yellow-300 mb-2">투자자 심리</h4>
                        <p>공포 & 탐욕 지수가 43으로 중립에 가까운 수준을 보이고 있어, 현재 시장 참여자들의 심리가 극단적이지 않은 균형 상태임을 시사합니다. 향후 주요 경제 지표 발표나 기업 실적 등에 따라 시장 방향성이 결정될 수 있음을 의미합니다.</p>
                    </section>
                    
                    <section>
                        <h4 className="font-semibold text-purple-300 mb-2">투자 전략</h4>
                        <p>투자자들은 이러한 시장 상황을 고려하여 단기적으로는 신중한 접근이 필요하며, 주요 경제 지표와 기업 실적 발표에 주목할 필요가 있습니다. 또한, 글로벌 정치 경제 이슈와 중앙은행의 통화 정책 방향성에 대한 모니터링도 중요할 것으로 보입니다.</p>
                    </section>
                </div>
            </CardContent>
        </Card>
    )
}

export default MarketInsights

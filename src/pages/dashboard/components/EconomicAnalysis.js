import { Card, CardContent } from '../../../components/Card.js'

const EconomicAnalysis = () => {
    return (
        <Card className="bg-gray-700 text-white">
            <CardContent >
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="mr-2" role="img" aria-label="chart">💡</span>경제 지표 분석
                </h3>
                <div className="space-y-4 text-sm">
                <section>
                <h4 className="font-semibold text-blue-300 mb-2">경제 동향</h4>
                <p>미국 경제는 현재 긍정적인 모멘텀을 보이고 있습니다. 현재 경기 침체 확률은 8%로 나타나며, 전월 대비 3%p 감소한 수치를 기록하고 있습니다. 여러 경제 지표 중, 특히 PMI와 GDP가 안정적으로 유지되고 있어 미국 경제는 점진적인 성장세를 보일 것으로 예상됩니다.</p>
                </section>

                <section>
                    <h4 className="font-semibold text-green-300 mb-2">금융 환경</h4>
                    <p>미국 제조업 생산과 비농업 신규취업자 증감률이 미미한 상승세를 보이는 반면, 산업 생산 지수는 현 상태를 유지하고 있습니다. 이러한 지표들은 전반적으로 경제 안정화를 나타내며, 인플레이션 억제 정책이 계속해서 금융 시장에 영향을 미치고 있음을 시사합니다.</p>
                </section>

                <section>
                    <h4 className="font-semibold text-yellow-300 mb-2">소비 및 고용</h4>
                    <p>자동차 소매 판매와 소비자 신뢰 지수가 안정적인 수치를 기록하고 있으며, 고용 시장 또한 안정세를 유지하고 있습니다. 이러한 요소들은 소비 심리와 고용 시장의 강세를 반영하며, 경제 회복을 뒷받침하는 중요한 역할을 하고 있습니다.</p>
                </section>

                <section>
                    <h4 className="font-semibold text-purple-300 mb-2">전망 및 투자 시사점</h4>
                    <p>경기 선행 지수의 상승과 더불어, 향후 미국 경제는 완만한 성장세를 보일 것으로 예상됩니다. 그러나 금리 정책과 인플레이션의 변동 가능성을 주의 깊게 살펴볼 필요가 있습니다. 투자자들은 이러한 경제 신호들을 종합적으로 고려하여 신중한 투자가 요구됩니다.</p>
                </section>

                </div>
            </CardContent>
        </Card>
    )
}

export default EconomicAnalysis

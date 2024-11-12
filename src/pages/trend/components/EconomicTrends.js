import { Card, CardContent } from '../../../components/Card.js'

const EconomicTrends = () => {
    return (
        <Card className="bg-gray-900 shadow-lg border border-gray-700">
            <CardContent className="p-5">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-blue-300 font-medium mb-2">금리 및 물가</h3>
                        <p className="text-gray-200 text-sm leading-relaxed">
                            3분기 말 기준금리는 전분기 말과 동일한 3.50%를 기록함. 소비자물가지수는 전월대비 0.1%, 전년동월대비 1.6% 상승
                        </p>
                    </div>

                    <div>
                        <h3 className="text-blue-300 font-medium mb-2">수출입 동향</h3>
                        <p className="text-gray-200 text-sm leading-relaxed">
                            3분기 전년동기 대비 수출은 10.7% 증가하였고, 4개 분기 연속 수출 상승세 지속. 수입은 전년동기 대비 6.2% 증가함. 무역수지는 16개월 연속 흑자 기록. 15대 주력 수출 품목 중 반도체, 선박 등 6개 품목 수출이 증가하며 무역수지는 흑자 기록
                        </p>
                    </div>

                    <div>
                        <h3 className="text-blue-300 font-medium mb-2">물가 동향</h3>
                        <p className="text-gray-200 text-sm leading-relaxed">
                            소비자물가지수는 전년동월대비 1.6% 상승. 서비스, 농축수산물, 전기·가스·수도가 전년동월대비 모두 상승
                        </p>
                    </div>

                    <div>
                        <h3 className="text-blue-300 font-medium mb-2">GDP</h3>
                        <p className="text-gray-200 text-sm leading-relaxed">
                            GDP는 2분기 말 전분기 대비 -0.2%를 기록하며 역성장 하였으며, 민간소비 및 건설 투자 부진이 2분기 국내 GDP 역성장의 주요 원인. 다만, 전년 동기 대비로는 2.3% 회복함에 따라, 한국은행은 연간 성장률 목표인 2.5% 달성이 가능할 것으로 예상
                        </p>
                    </div>

                    <div>
                        <h3 className="text-blue-300 font-medium mb-2">환율</h3>
                        <p className="text-gray-200 text-sm leading-relaxed">
                            달러인덱스는 하반기 미국 연방준비제도이사회 2회 이상 기준금리 인하 기대감 및 9월 실제 기준금리 인하 실현으로 전분기 말 대비 4.76% 하락한 100.52pt를 기록. 원/달러 환율은 3분기 일본 기준금리 인상 및 이시바 시게루 총리 당선에 따른 추가 인상 기대감, 중국의 대규모 경기 부양책 지속에 따른 아시아 통화 가치 급등에 대한 동조화로 전분기 말 대비 5.00% 하락한 1,307.80원 기록
                        </p>
                        <div className="mt-2 text-sm text-gray-300">
                            <p>● 달러인덱스 : '24년 2분기 말 105.55pt → '24년 3분기 말 100.52pt</p>
                            <p>● 원/달러 환율(종가기준) : '24년 2분기 말 1,376.70원 → '24년 3분기 말 1,307.80원</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default EconomicTrends; 
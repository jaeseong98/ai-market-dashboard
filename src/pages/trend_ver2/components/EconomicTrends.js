import { Card, CardContent } from '../../../components/Card.js';

const EconomicTrends = () => {
    return (
        <Card className="bg-gray-800 text-white w-full">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">📊</span>
                    <h3 className="text-lg font-medium text-white">경제상황</h3>
                </div>

                <div className="space-y-8">
                    {/* 금리 및 물가 섹션 */}
                    <section>
                        <div className="flex items-center mb-4">
                            <h4 className="flex items-center text-yellow-300">
                                <span className="w-2 h-2 bg-yellow-300 rounded-full mr-2"></span>
                                금리 및 물가
                            </h4>
                        </div>
                        <p className="text-sm text-gray-200">
                            국내 기준금리는 전년 대비 0.25%p 상승한 3.50% 기록, 국내 소비자물가지수는 전년 대비 3.6% 상승
                        </p>
                    </section>

                    {/* 무역수지 섹션 */}
                    <section>
                        <div className="flex items-center mb-4">
                            <h4 className="flex items-center text-blue-300">
                                <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                                무역수지
                            </h4>
                        </div>
                        <p className="text-sm text-gray-200">
                            수출은 전년 대비 7.4% 감소, 수입은 전년 대비 12.1% 감소하며 무역수지 적자 폭 축소
                        </p>
                    </section>

                    {/* 환율 섹션 */}
                    <section>
                        <div className="flex items-center mb-4">
                            <h4 className="flex items-center text-green-300">
                                <span className="w-2 h-2 bg-green-300 rounded-full mr-2"></span>
                                환율
                            </h4>
                        </div>
                        <p className="text-sm text-gray-200">
                            원/달러 환율은 무역수지 적자 지속 등으로 전월 말 대비 1.86% 상승
                        </p>
                    </section>
                </div>
            </CardContent>
        </Card>
    );
};

export default EconomicTrends; 
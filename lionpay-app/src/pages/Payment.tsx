import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ArrowLeft, CheckCircle, Store, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'shop' | 'amount' | 'summary' | 'processing' | 'success';

const SHOPS = [
    { id: '1', name: '스타벅스', category: '카페' },
    { id: '2', name: 'GS25', category: '편의점' },
    { id: '3', name: '맥도날드', category: '음식점' },
    { id: '4', name: '세븐일레븐', category: '편의점' },
];

export default function Payment() {
    const navigate = useNavigate();
    const { country, money, points, paymentPriority, addPoints, deductMoney, deductPoints, addTransaction } = useAppStore();

    const [step, setStep] = useState<Step>('shop');
    const [selectedShop, setSelectedShop] = useState(SHOPS[0]);
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    // Result state
    const [usedMoney, setUsedMoney] = useState(0);
    const [usedPoints, setUsedPoints] = useState(0);
    const [earnedPoints, setEarnedPoints] = useState(0);

    const handleHeaderBack = () => {
        if (step === 'shop') navigate(-1);
        if (step === 'amount') setStep('shop');
    };

    const handlePay = async () => {
        if (!amount) return;
        const payAmount = parseInt(amount);
        if (payAmount <= 0) return;

        // Convert input amount to KRW for internal check if necessary, 
        // but for this mock let's assume direct value usage but show currency symbol.
        // Actually, to implement "money vs points" logic correctly, we treat them as 1:1 value units for simplicity within the app logic,
        // but display them with rates.
        // Let's stick to the previous plan: calculate costs in "Store Units" (KRW).
        const krwCost = Math.floor(payAmount / country.rate);

        // Calculate Payment Mix based on Priority
        let moneyToUse = 0;
        let pointsToUse = 0;

        if (paymentPriority === 'points') {
            if (points >= krwCost) {
                pointsToUse = krwCost;
                moneyToUse = 0;
            } else {
                pointsToUse = points;
                moneyToUse = krwCost - points;
            }
        } else {
            // Money Priority (Default)
            moneyToUse = krwCost;
            pointsToUse = 0;
        }

        // Check sufficiency
        if (money < moneyToUse) {
            setError('잔액이 부족합니다. 충전 후 이용해주세요.');
            return;
        }

        // Start Processing
        setStep('processing');

        // Mock API Call (0.5s delay)
        await new Promise(resolve => setTimeout(resolve, 500));

        // Deduct
        if (moneyToUse > 0) deductMoney(moneyToUse);
        if (pointsToUse > 0) deductPoints(pointsToUse);

        // Earn Points (1% of total KRW cost)
        const pointsEarned = Math.floor(krwCost * 0.01);
        addPoints(pointsEarned);

        // Set Result State
        setUsedMoney(moneyToUse);
        setUsedPoints(pointsToUse);
        setEarnedPoints(pointsEarned);

        // Record Transaction(s)
        const now = new Date();
        const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        addTransaction({
            id: Date.now(),
            type: 'use',
            title: selectedShop.name,
            date: dateStr,
            time: timeStr,
            amount: -(moneyToUse + pointsToUse), // Total cost (simulated negative)
            earned: pointsEarned
        });

        addTransaction({
            id: Date.now() + 1,
            type: 'earn',
            title: `${selectedShop.name} 적립`,
            date: dateStr,
            time: timeStr,
            amount: pointsEarned
        });

        setStep('success');
    };

    if (step === 'success') {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-white animate-in zoom-in duration-300">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-6"
                >
                    <CheckCircle className="w-10 h-10" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">결제 완료</h2>
                <div className="text-center space-y-4 mb-8">
                    <p className="text-gray-500">
                        {country.name} {selectedShop.name}에서
                    </p>
                    <div className="bg-gray-50 p-6 rounded-2xl w-full shadow-sm border border-gray-100">
                        <div className="text-center mb-6">
                            <span className="text-gray-500 text-sm mb-1 block">총 결제금액</span>
                            <span className="text-3xl font-bold text-gray-900">
                                {country.currency === 'KRW' ? '' : country.currency === 'USD' ? '$' : '¥'}
                                {parseInt(amount).toLocaleString()}
                                {country.currency === 'KRW' ? '원' : ''}
                            </span>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">머니 사용</span>
                                <span className="font-bold text-gray-900">{Math.floor(usedMoney * country.rate).toLocaleString()} {country.currency}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">포인트 사용</span>
                                <span className="font-bold text-gray-900">{Math.floor(usedPoints * country.rate).toLocaleString()} P</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100 inline-block">
                        <p className="text-sm text-yellow-800 font-bold">
                            + {earnedPoints.toLocaleString()} P 적립 완료!
                        </p>
                    </div>
                </div>
                <Button className="w-full" onClick={() => navigate('/')}>
                    홈으로 돌아가기
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 pt-2"
        >
            {step === 'processing' ? (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                    <p className="font-bold text-gray-600">결제 요청 중...</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2 mb-6">
                        <button onClick={handleHeaderBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold">
                            {step === 'shop' && '결제처 선택'}
                            {step === 'amount' && '금액 입력'}
                        </h1>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'shop' && (
                            <motion.div
                                key="shop"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-3"
                            >
                                <p className="text-sm text-gray-500 mb-2">현재 결제 국가: <span className="font-bold text-primary-600">{country.name}</span></p>
                                {SHOPS.map((shop) => (
                                    <Card
                                        key={shop.id}
                                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100"
                                        onClick={() => {
                                            setSelectedShop(shop);
                                            setStep('amount');
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                                <Store className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-lg">{shop.name}</p>
                                                <p className="text-sm text-gray-500">{shop.category}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </Card>
                                ))}
                            </motion.div>
                        )}

                        {step === 'amount' && (
                            <motion.div
                                key="amount"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-500">결제처</span>
                                        <span className="font-bold text-lg">{selectedShop.name}</span>
                                    </div>
                                    <div className="h-px bg-gray-100 my-4" />
                                    <Input
                                        label={`결제 금액 (${country.currency})`}
                                        type="number"
                                        placeholder="0"
                                        value={amount}
                                        onChange={(e) => {
                                            setAmount(e.target.value);
                                            setError('');
                                        }}
                                        className="text-2xl font-bold text-right"
                                        autoFocus
                                        error={error}
                                    />
                                    <p className="text-right text-xs text-gray-400 mt-2">
                                        우선 사용: {paymentPriority === 'money' ? '라이언 페이 머니' : '라이언 페이 포인트'}
                                    </p>
                                </Card>
                                <Button
                                    className="w-full"
                                    size="lg"
                                    disabled={!amount || parseInt(amount) <= 0}
                                    onClick={handlePay}
                                >
                                    결제 하기
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </motion.div>
    );
}

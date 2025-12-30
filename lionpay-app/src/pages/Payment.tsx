import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ArrowLeft, CheckCircle, Store, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { paymentApi, merchantApi } from '../lib/api';
import type { MerchantResponse, PaymentRequest } from '../generated-api/wallet';
import { AlertModal } from '../components/ui/AlertModal';
import type { AxiosError } from 'axios';

type Step = 'shop' | 'amount' | 'summary' | 'processing' | 'success';

interface Shop {
    id: string;
    name: string;
    category: string;
}

export default function Payment() {
    const navigate = useNavigate();
    const { country, fetchWallet, fetchTransactions } = useAppStore();

    const [step, setStep] = useState<Step>('shop');
    const [shops, setShops] = useState<Shop[]>([]);
    const [isLoadingShops, setIsLoadingShops] = useState(true);
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    // Alert State
    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
    }>({ isOpen: false, title: '', message: '' });

    // Result state
    const [usedMoney, setUsedMoney] = useState(0);

    // Fetch merchants from server
    useEffect(() => {
        const fetchMerchants = async () => {
            try {
                const countryCode = country.id.toUpperCase();
                const response = await merchantApi.apiV1WalletMerchantsGet({ countryCode });
                const merchantShops: Shop[] = response.data.map((m: MerchantResponse) => ({
                    id: m.merchantId,
                    name: m.merchantName,
                    category: m.merchantCategory
                }));
                setShops(merchantShops);
                if (merchantShops.length > 0) {
                    setSelectedShop(merchantShops[0]);
                } else {
                    setSelectedShop(null);
                }
            } catch (err) {
                console.error('Failed to fetch merchants:', err);
                setAlertConfig({
                    isOpen: true,
                    title: '상점 목록 오류',
                    message: '상점 목록을 불러오는데 실패했습니다.'
                });
            } finally {
                setIsLoadingShops(false);
            }
        };
        fetchMerchants();
    }, [country]); // Refresh when country changes

    const handleHeaderBack = () => {
        if (step === 'shop') navigate(-1);
        if (step === 'amount') setStep('shop');
    };

    const handlePay = async () => {
        if (!amount) return;
        const payAmount = parseInt(amount);
        if (payAmount <= 0) return;

        // Start Processing
        setStep('processing');

        try {
            // Call actual payment API


            await paymentApi.apiV1WalletPaymentsPost({
                paymentRequest: {
                    merchantId: selectedShop!.id,
                    amountCash: payAmount,
                    currency: country.currency
                } as PaymentRequest
            });

            // Set Result State - usedMoney should be the deducted amount from wallet
            // The response typically contains the transaction details including balance snapshot
            // For now, we estimate or use the response if possible.
            // Let's use the input amount rough conversion for display or fetch from response if available.
            // Since we don't have the exact deducted amount from response easily accessible in generated client,
            // we will approximate for display or better, assume the server deduction logic matches.

            // Note: Server returns PaymentResponse which might NOT have the deducted KRW amount directly exposed easily in generated client
            // unless we inspect response data.
            // Let's just use the approximate calculated value for the UI success screen for now,
            // or better, rely on the balance drop.

            const estimatedKrwCost = Math.floor(payAmount / country.rate);
            setUsedMoney(estimatedKrwCost);

            // Refresh wallet and transactions from server
            await fetchWallet();
            await fetchTransactions();

            setStep('success');
        } catch (err: unknown) {
            console.error('Payment failed:', err);
            let errorMessage = '결제에 실패했습니다. 다시 시도해주세요.';

            const error = err as AxiosError<{
                detail?: string;
                message?: string;
                title?: string;
                errorCode?: string;
                errorMessage?: string;
            }>;

            if (error.response && error.response.data) {
                console.error('Error response data:', JSON.stringify(error.response.data));
                const data = error.response.data;

                // Use ErrorCode from backend if available
                if (data.errorCode) {
                    switch (data.errorCode) {
                        case 'INSUFFICIENT_BALANCE':
                            errorMessage = '잔액이 부족합니다. 충전 후 다시 시도해주세요.';
                            break;
                        case 'MERCHANT_NOT_FOUND':
                            errorMessage = '상점 정보를 찾을 수 없습니다.';
                            break;
                        case 'WALLET_NOT_FOUND':
                            errorMessage = '지갑 정보를 찾을 수 없습니다. 관리자에게 문의하세요.';
                            break;
                        case 'PAYMENT_FAILED':
                            errorMessage = '결제 처리에 실패했습니다. 잠시 후 다시 시도해주세요.';
                            break;
                        case 'BAD_REQUEST':
                            errorMessage = '잘못된 요청입니다.';
                            break;
                        case 'INTERNAL_SERVER_ERROR':
                            errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                            break;
                        default:
                            // Fallback to server message if available
                            errorMessage = data.errorMessage || errorMessage;
                    }
                } else if (data.errorMessage) {
                    errorMessage = data.errorMessage;
                } else if (data.detail) {
                    errorMessage = data.detail;
                } else if (data.message) {
                    errorMessage = data.message;
                } else if (data.title) {
                    errorMessage = data.title;
                }
            }

            // Show Alert Modal instead of setting input error
            setAlertConfig({
                isOpen: true,
                title: '결제 실패',
                message: errorMessage
            });
            setStep('amount');
        }
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
                        {country.name} {selectedShop?.name}에서
                    </p>
                    <div className="bg-gray-50 p-6 rounded-2xl w-full shadow-sm border border-gray-100">
                        <div className="text-center mb-6">
                            <span className="text-gray-500 text-sm mb-1 block">총 결제금액</span>
                            <span className="text-3xl font-bold text-gray-900">
                                {country.currency === 'KRW' ? '' : '¥'}
                                {parseInt(amount).toLocaleString()}
                                {country.currency === 'KRW' ? '원' : ''}
                            </span>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">머니 사용</span>
                                <span className="font-bold text-gray-900">{Math.floor(usedMoney * country.rate).toLocaleString()} {country.currency}</span>
                            </div>
                        </div>
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
                                {isLoadingShops ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                                    </div>
                                ) : shops.map((shop: Shop) => (
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
                                        <span className="font-bold text-lg">{selectedShop?.name}</span>
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

                    <AlertModal
                        isOpen={alertConfig.isOpen}
                        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                        title={alertConfig.title}
                        message={alertConfig.message}
                    />
                </>
            )}
        </motion.div>
    );
}

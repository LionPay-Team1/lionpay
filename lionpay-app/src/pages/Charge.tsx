import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { walletApi } from '../lib/api';
import { AlertModal } from '../components/ui/AlertModal';
import type { AdjustBalanceRequestAmount } from '../generated-api/wallet';
import type { AxiosError } from 'axios';

export default function Charge() {
    const navigate = useNavigate();
    const { money, fetchWallet, fetchTransactions } = useAppStore();
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAlert, setShowAlert] = useState(false);

    const handleCharge = async () => {
        if (!amount || parseInt(amount) <= 0) return;

        setIsLoading(true);
        setError('');

        try {
            await walletApi.v1WalletChargePost({
                chargeRequest: {
                    amount: parseInt(amount) as unknown as AdjustBalanceRequestAmount
                }
            });

            // Refresh wallet balance and transactions after charge
            await fetchWallet();
            await fetchTransactions();

            setShowAlert(true);
        } catch (err: unknown) {
            console.error('Charge failed:', err);
            const error = err as AxiosError<{ detail?: string; message?: string }>;
            if (error.response) {
                console.error('Error response data:', JSON.stringify(error.response.data));
            }
            setError('충전에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
            <div className="flex items-center gap-2 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">포인트 충전</h1>
            </div>

            <Card className="p-6">
                <p className="text-gray-500 text-sm mb-2">현재 잔액</p>
                <p className="text-2xl font-bold text-gray-900">{money.toLocaleString()} 원</p>
            </Card>

            <div className="space-y-4">
                <Input
                    label="충전할 금액"
                    placeholder="0"
                    type="number"
                    value={amount}
                    onChange={(e) => {
                        setAmount(e.target.value);
                        setError('');
                    }}
                    className="text-lg font-bold"
                    error={error}
                    disabled={isLoading}
                />

                <div className="grid grid-cols-3 gap-2">
                    {['10000', '30000', '50000'].map((val) => (
                        <button
                            key={val}
                            onClick={() => setAmount(val)}
                            disabled={isLoading}
                            className="py-2 px-4 rounded-lg bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            +{parseInt(val).toLocaleString()}
                        </button>
                    ))}
                </div>
            </div>

            <Button
                className="w-full mt-8"
                size="lg"
                onClick={handleCharge}
                disabled={!amount || parseInt(amount) <= 0 || isLoading}
                isLoading={isLoading}
            >
                충전하기
            </Button>

            <AlertModal
                isOpen={showAlert}
                onClose={() => {
                    setShowAlert(false);
                    navigate('/');
                }}
                title="충전 완료"
                message="포인트 충전이 완료되었습니다!"
            />
        </div>
    );
}

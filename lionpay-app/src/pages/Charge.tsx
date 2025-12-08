import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Charge() {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');

    const handleCharge = () => {
        // Mock charge
        alert('충전이 완료되었습니다!');
        navigate('/');
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
                <p className="text-2xl font-bold text-gray-900">125,000 원</p>
            </Card>

            <div className="space-y-4">
                <Input
                    label="충전할 금액"
                    placeholder="0"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg font-bold"
                />

                <div className="grid grid-cols-3 gap-2">
                    {['10000', '30000', '50000'].map((val) => (
                        <button
                            key={val}
                            onClick={() => setAmount(val)}
                            className="py-2 px-4 rounded-lg bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
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
                disabled={!amount || parseInt(amount) <= 0}
            >
                충전하기
            </Button>
        </div>
    );
}

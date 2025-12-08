import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatPhoneNumber, toE164 } from '../lib/utils';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Convert to E.164 for backend
        const e164Phone = toE164(phone);
        console.log('Sending to backend:', e164Phone);

        // Mock login with delay
        setTimeout(() => {
            setIsLoading(false);
            navigate('/');
        }, 500);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white animate-in fade-in duration-500">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                        <span className="text-primary-500">Lion</span>Pay
                    </h1>
                    <p className="text-gray-500">간편하고 안전한 포인트 결제</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <Input
                            label="휴대전화 번호"
                            placeholder="010-1234-5678"
                            type="tel"
                            maxLength={13}
                            value={phone}
                            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                        />
                        <Input
                            label="비밀번호"
                            placeholder="******"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                        로그인
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-500">
                    계정이 없으신가요? <Link to="/signup" className="text-primary-600 font-bold hover:underline">회원가입</Link>
                </p>
            </div>
        </div>
    );
}

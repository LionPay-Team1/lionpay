import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatPhoneNumber, toE164 } from '../lib/utils';
import { useNavigate, Link } from 'react-router-dom';

import { useAppStore } from '../lib/store';

export default function SignIn() {
    const navigate = useNavigate();
    const { login } = useAppStore();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Convert to E.164 for backend for normal users
            const e164Phone = toE164(phone);
            console.log('Sending to backend:', e164Phone);

            await login(e164Phone, password); // Set auth state to true
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('로그인에 실패했습니다. 정보를 확인해주세요.');
            setIsLoading(false);
        }
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

                <form onSubmit={handleSignIn} className="space-y-6">
                    <div className="space-y-4">
                        <Input
                            label="휴대전화 번호"
                            placeholder="010-1234-5678"
                            type="tel"
                            maxLength={13}
                            value={phone}
                            disabled={isLoading}
                            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                        />
                        <Input
                            label="비밀번호"
                            placeholder="******"
                            type="password"
                            value={password}
                            disabled={isLoading}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
                                {error}
                            </div>
                        )}
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

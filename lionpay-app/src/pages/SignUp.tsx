import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatPhoneNumber, toE164 } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { authApi, setAuthToken } from '../lib/api';
import { useAppStore } from '../lib/store';

export default function SignUp() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        passwordConfirm: '',
    });
    const [error, setError] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (e.target.name === 'phone') {
            value = formatPhoneNumber(value);
        }
        setFormData(prev => ({ ...prev, [e.target.name]: value }));
        setError('');
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.passwordConfirm) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (!phoneDigits.match(/^01(?:0|1|[6-9])(?:\d{3}|\d{4})\d{4}$/)) {
            setError('올바른 휴대전화 번호 형식이 아닙니다.');
            return;
        }

        setIsLoading(true);

        try {
            // Convert to E.164
            const e164Phone = toE164(formData.phone);
            console.log('Sending to backend:', { ...formData, phone: e164Phone });

            const response = await authApi.signUp({
                signUpRequest: {
                    name: formData.name,
                    phone: e164Phone,
                    password: formData.password,
                }
            });

            // Store auth tokens and navigate to home page
            if (response.data.accessToken && response.data.refreshToken) {
                setAuthToken(response.data.accessToken, response.data.refreshToken);
                // Update store state and fetch initial data
                const store = useAppStore.getState();
                useAppStore.setState({ isAuthenticated: true });
                await store.fetchUserInfo();
                await store.fetchWallet();
                await store.fetchTransactions();
                navigate('/');
            }
        } catch (err) {
            console.error('SignUp failed:', err);
            setError('회원가입에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col p-6 bg-white animate-in slide-in-from-right-10 duration-500">
            <div className="flex items-center gap-2 mb-8">
                <button onClick={() => navigate('/signin')} className="p-2 -ml-2 text-gray-600">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">회원가입</h1>
            </div>

            <form onSubmit={handleSignUp} className="space-y-6">
                <Input
                    label="이름"
                    name="name"
                    placeholder="홍길동"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="휴대전화 번호"
                    name="phone"
                    placeholder="010-1234-5678"
                    type="tel"
                    maxLength={13}
                    value={formData.phone}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="비밀번호"
                    name="password"
                    type="password"
                    placeholder="******"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="비밀번호 확인"
                    name="passwordConfirm"
                    type="password"
                    placeholder="******"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    error={error}
                    required
                />

                <Button type="submit" className="w-full mt-8" size="lg" isLoading={isLoading}>
                    회원가입
                </Button>
            </form>
        </div>
    );
}

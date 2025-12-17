import { useState } from 'react';
import { Plus, CreditCard, Send, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../lib/store';

export default function Home() {
    const { country, money, fetchWallet, fetchTransactions, fetchExchangeRates, transactions } = useAppStore();
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Refresh handler
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                fetchWallet(),
                fetchTransactions(),
                fetchExchangeRates(),
                new Promise(resolve => setTimeout(resolve, 1000)) // Min 1 sec delay
            ]);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Exchange Rate Logic
    const convertedAmount = money * country.rate;
    const precision = country.precision ?? 0;
    const convertedMoney = convertedAmount.toLocaleString(undefined, {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision
    });

    const currencySym = country.currency === 'KRW' ? '' : '¥';
    const currencyName = country.currency === 'KRW' ? '원' : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pt-4"
        >
            {/* Money Card (Main) */}
            <section className="space-y-2">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg font-bold text-gray-900">내 지갑</h2>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                        title="새로고침"
                    >
                        <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <Card className="p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl shadow-primary-500/20 border-none relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <div className="relative z-10">
                        <p className="text-primary-100 font-medium mb-1 flex items-center justify-between">
                            <span>라이언 페이 머니</span>
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{country.currency}</span>
                        </p>
                        <h3 className="text-3xl font-bold mb-6">
                            {currencySym} {convertedMoney}
                            <span className="text-lg font-normal ml-1">{currencyName}</span>
                        </h3>

                        <div className="flex gap-3">
                            <Link to="/charge" className="flex-1">
                                <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-0">
                                    <Plus className="w-4 h-4 mr-2" /> 충전
                                </Button>
                            </Link>
                            <Link to="/payment" className="flex-1">
                                <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-0">
                                    <CreditCard className="w-4 h-4 mr-2" /> 결제
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            </section>

            <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg font-bold text-gray-900">최근 내역</h2>
                    <Link to="/history" className="text-sm text-gray-500 hover:text-primary-600">전체보기</Link>
                </div>

                <div className="space-y-3">
                    {transactions.slice(0, 3).map((tx) => (
                        <Card key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group active:scale-[0.98]">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${tx.type === 'charge' ? 'bg-blue-50 text-blue-500' :
                                    'bg-primary-50 text-primary-500 group-hover:bg-primary-100'
                                    }`}>
                                    {tx.type === 'charge' ? <Plus className="w-5 h-5" /> :
                                        <Send className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{tx.title}</p>
                                    <p className="text-sm text-gray-500">{tx.date} {tx.time}</p>
                                </div>
                            </div>
                            <p className={`font-bold ${tx.type === 'charge' ? 'text-blue-600' : 'text-gray-900'}`}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}원
                            </p>
                        </Card>
                    ))}
                </div>
            </section>
        </motion.div>
    );
}

import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { ArrowDownLeft, ArrowUpRight, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { TransactionDetailModal } from '../components/ui/TransactionDetailModal';
import { cn } from '../lib/utils';
import { useAppStore, type Transaction } from '../lib/store';

type FilterType = 'all' | 'charge' | 'use' | 'earn';

export default function History() {
    const [filter, setFilter] = useState<FilterType>('all');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const { transactions } = useAppStore();

    const filteredTransactions = transactions.filter(tx => {
        if (filter === 'all') return true;
        return tx.type === filter;
    });

    // Group by Date
    const groupedTransactions = filteredTransactions.reduce((acc, tx) => {
        const date = tx.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(tx);
        return acc;
    }, {} as Record<string, typeof transactions>);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 pt-2"
        >
            <div className="flex items-center justify-between px-1">
                <h1 className="text-xl font-bold">이용 내역</h1>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
                {(['all', 'charge', 'use', 'earn'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                            filter === f ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        {f === 'all' && '전체'}
                        {f === 'charge' && '충전'}
                        {f === 'use' && '사용'}
                        {f === 'earn' && '적립'}
                    </button>
                ))}
            </div>

            {Object.entries(groupedTransactions).map(([date, txs]) => (
                <div key={date} className="space-y-2">
                    <h3 className="text-sm font-bold text-gray-500 px-1 mt-4">{date}</h3>
                    {txs.map((tx) => (
                        <Card
                            key={tx.id}
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 active:scale-[0.99] transition-all"
                            onClick={() => setSelectedTransaction(tx)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'charge' ? 'bg-blue-50 text-blue-600' :
                                    tx.type === 'earn' ? 'bg-yellow-50 text-yellow-600' :
                                        'bg-gray-100 text-gray-500'
                                    }`}>
                                    {tx.type === 'charge' && <ArrowDownLeft className="w-5 h-5" />}
                                    {tx.type === 'use' && <ArrowUpRight className="w-5 h-5" />}
                                    {tx.type === 'earn' && <Coins className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{tx.title}</p>
                                    <p className="text-xs text-gray-500">{tx.time}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${tx.type === 'charge' ? 'text-blue-600' :
                                    tx.type === 'earn' ? 'text-yellow-600' :
                                        'text-gray-900'
                                    }`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                                    {tx.type === 'earn' ? ' P' : ' 원'}
                                </p>
                                {tx.type === 'use' && tx.earned && (
                                    <p className="text-xs text-yellow-600 font-medium">
                                        +{tx.earned} P 적립
                                    </p>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            ))}

            {filteredTransactions.length === 0 && (
                <div className="py-20 text-center text-gray-500">
                    내역이 없습니다.
                </div>
            )}

            <TransactionDetailModal
                isOpen={!!selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
                transaction={selectedTransaction}
            />
        </motion.div>
    );
}

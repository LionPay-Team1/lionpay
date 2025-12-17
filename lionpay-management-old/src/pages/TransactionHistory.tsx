import { useState, useCallback } from 'react';
import { transactionsApi, type Transaction } from '../api/transactions';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export function TransactionHistory() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState('');
    const [searched, setSearched] = useState(false);

    const loadTransactions = useCallback(async (uid: string) => {
        if (!uid.trim()) {
            alert('사용자 ID를 입력해주세요.');
            return;
        }

        setLoading(true);
        setSearched(true);
        try {
            const data = await transactionsApi.getUserTransactions(uid, { limit: 50 });
            setTransactions(data);
        } catch (error) {
            console.error("Failed to load transactions", error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadTransactions(userId);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ko-KR');
    };

    const getTxTypeLabel = (txType: string) => {
        const labels: Record<string, string> = {
            'Payment': '결제',
            'Charge': '충전',
            'AdminCharge': '관리자 충전',
            'AdminDeduct': '관리자 차감'
        };
        return labels[txType] || txType;
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Transaction History</h2>
                <form onSubmit={handleSearch} className="search-form">
                    <Input
                        placeholder="Enter User ID (UUID)..."
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="search-input"
                    />
                    <Button type="submit" variant="primary">Search</Button>
                </form>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Merchant</th>
                            <th>Amount</th>
                            <th>Currency</th>
                            <th>Balance After</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center">Loading...</td></tr>
                        ) : !searched ? (
                            <tr><td colSpan={7} className="text-center">사용자 ID를 입력하고 검색하세요.</td></tr>
                        ) : transactions.length === 0 ? (
                            <tr><td colSpan={7} className="text-center">No transactions found.</td></tr>
                        ) : (
                            transactions.map(tx => (
                                <tr key={tx.id}>
                                    <td>{formatDate(tx.createdAt)}</td>
                                    <td>
                                        <span className={`type-badge ${tx.txType.toLowerCase()}`}>
                                            {getTxTypeLabel(tx.txType)}
                                        </span>
                                    </td>
                                    <td>{tx.merchantName || '-'}</td>
                                    <td className={tx.amount >= 0 ? 'text-green' : 'text-red'}>
                                        {tx.amount >= 0 ? '+' : ''}₩{tx.amount.toLocaleString()}
                                    </td>
                                    <td>{tx.currency}</td>
                                    <td>₩{tx.balanceAfter.toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge ${tx.txStatus.toLowerCase()}`}>
                                            {tx.txStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
        .type-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          text-transform: uppercase;
        }
        .type-badge.payment {
          background: rgba(244, 67, 54, 0.1);
          color: #f44336;
        }
        .type-badge.charge, .type-badge.admincharge {
          background: rgba(76, 175, 80, 0.1);
          color: #4caf50;
        }
        .type-badge.admindeduct {
          background: rgba(255, 152, 0, 0.1);
          color: #ff9800;
        }
        .text-green { color: #4caf50; }
        .text-red { color: #f44336; }
      `}</style>
        </div>
    );
}

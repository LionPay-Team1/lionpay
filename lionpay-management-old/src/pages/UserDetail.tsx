import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersApi, type User } from '../api/users';
import { walletApi } from '../api/wallet';
import { transactionsApi, type Transaction } from '../api/transactions';
import { adminWalletApi } from '../api/client';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export function UserDetail() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [balance, setBalance] = useState<number | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Balance adjustment
    const [showAdjustForm, setShowAdjustForm] = useState(false);
    const [adjustAmount, setAdjustAmount] = useState('');
    const [adjustReason, setAdjustReason] = useState('');
    const [adjusting, setAdjusting] = useState(false);

    const loadData = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const [userData, walletData, txData] = await Promise.all([
                usersApi.getUser(userId),
                walletApi.getUserBalance(userId).catch(() => null),
                transactionsApi.getUserTransactions(userId, { limit: 20 })
            ]);

            setUser(userData);
            setBalance(walletData?.balance ?? null);
            setTransactions(txData);
        } catch (error) {
            console.error('Failed to load user data', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAdjustBalance = async () => {
        if (!userId || !adjustAmount || !adjustReason) {
            alert('금액과 사유를 입력해주세요.');
            return;
        }

        setAdjusting(true);
        try {
            await adminWalletApi.apiV1AdminWalletsUserIdAdjustPost({
                userId,
                adjustBalanceRequest: {
                    amount: { amount: parseFloat(adjustAmount) } as unknown as { amount: number },
                    reason: adjustReason
                }
            });

            setShowAdjustForm(false);
            setAdjustAmount('');
            setAdjustReason('');
            await loadData(); // Reload to show updated balance
        } catch (error) {
            console.error('Failed to adjust balance', error);
            alert('잔액 조정에 실패했습니다.');
        } finally {
            setAdjusting(false);
        }
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

    if (loading) {
        return <div className="page-container"><p>Loading...</p></div>;
    }

    if (!user) {
        return (
            <div className="page-container">
                <p>사용자를 찾을 수 없습니다.</p>
                <Button onClick={() => navigate('/users')}>Back to Users</Button>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>User Detail</h2>
                <Button variant="secondary" onClick={() => navigate('/users')}>
                    Back to Users
                </Button>
            </div>

            {/* User Info Card */}
            <div className="card" style={{ marginBottom: '1rem' }}>
                <h3>User Information</h3>
                <div className="info-grid">
                    <div className="info-item">
                        <label>ID</label>
                        <span>{user.id}</span>
                    </div>
                    <div className="info-item">
                        <label>Phone</label>
                        <span>{user.phone}</span>
                    </div>
                    <div className="info-item">
                        <label>Name</label>
                        <span>{user.name}</span>
                    </div>
                    <div className="info-item">
                        <label>Status</label>
                        <span className={`status-badge ${user.status.toLowerCase()}`}>{user.status}</span>
                    </div>
                    <div className="info-item">
                        <label>Created At</label>
                        <span>{formatDate(user.createdAt)}</span>
                    </div>
                </div>
            </div>

            {/* Wallet Card */}
            <div className="card" style={{ marginBottom: '1rem' }}>
                <div className="card-header">
                    <h3>Wallet Balance</h3>
                    <Button variant="primary" className="btn-sm" onClick={() => setShowAdjustForm(!showAdjustForm)}>
                        Adjust Balance
                    </Button>
                </div>
                <div className="balance-display">
                    {balance !== null ? (
                        <span className="balance-value">₩{balance.toLocaleString()}</span>
                    ) : (
                        <span className="balance-value no-wallet">지갑 정보 없음</span>
                    )}
                </div>

                {showAdjustForm && (
                    <div className="adjust-form">
                        <div className="form-row">
                            <Input
                                type="number"
                                value={adjustAmount}
                                onChange={(e) => setAdjustAmount(e.target.value)}
                                placeholder="금액 (음수: 차감, 양수: 충전)"
                            />
                            <Input
                                value={adjustReason}
                                onChange={(e) => setAdjustReason(e.target.value)}
                                placeholder="조정 사유"
                            />
                            <Button variant="primary" onClick={handleAdjustBalance} disabled={adjusting}>
                                {adjusting ? '...' : 'Apply'}
                            </Button>
                            <Button variant="secondary" onClick={() => setShowAdjustForm(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Transactions */}
            <div className="card">
                <h3>Transaction History</h3>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Merchant</th>
                                <th>Amount</th>
                                <th>Balance After</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr><td colSpan={6} className="text-center">No transactions found.</td></tr>
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
            </div>

            <style>{`
        .card {
          background: var(--bg-secondary, #1a1a2e);
          border-radius: 8px;
          padding: 1.5rem;
        }
        .card h3 {
          margin-bottom: 1rem;
          font-size: 1rem;
          color: var(--text-secondary, #a0a0a0);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .card-header h3 {
          margin-bottom: 0;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .info-item label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-secondary, #a0a0a0);
          margin-bottom: 0.25rem;
        }
        .info-item span {
          font-size: 1rem;
        }
        .balance-display {
          text-align: center;
          padding: 1rem;
        }
        .balance-value {
          font-size: 2rem;
          font-weight: bold;
          color: var(--primary, #646cff);
        }
        .balance-value.no-wallet {
          color: var(--text-secondary, #a0a0a0);
          font-size: 1rem;
        }
        .adjust-form {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color, #333);
        }
        .form-row {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .form-row input {
          flex: 1;
        }
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
        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
        }
        .text-green { color: #4caf50; }
        .text-red { color: #f44336; }
      `}</style>
        </div>
    );
}

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersApi, type User } from '../api/users';
import { walletApi } from '../api/wallet';
import { transactionsApi, type Transaction } from '../api/transactions';
import { adminWalletApi } from '../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Wallet, RefreshCw } from 'lucide-react';

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
            await adminWalletApi.apiV1WalletAdminWalletsUserIdAdjustPost({
                userId,
                adjustBalanceRequest: {
                    amount: parseFloat(adjustAmount),
                    reason: adjustReason
                }
            });

            setShowAdjustForm(false);
            setAdjustAmount('');
            setAdjustReason('');
            await loadData();
        } catch (error) {
            console.error('Failed to adjust balance', error);
            alert('잔액 조정에 실패했습니다.');
        } finally {
            setAdjusting(false);
        }
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

    const getTxTypeVariant = (txType: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (txType.toLowerCase()) {
            case 'payment':
                return 'destructive';
            case 'charge':
            case 'admincharge':
                return 'default';
            case 'admindeduct':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">사용자를 찾을 수 없습니다.</p>
                <Button onClick={() => navigate('/users')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    돌아가기
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">사용자 상세</h2>
                <Button variant="outline" onClick={() => navigate('/users')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    목록으로
                </Button>
            </div>

            {/* User Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>사용자 정보</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">ID</p>
                            <p className="font-mono text-sm">{user.id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">전화번호</p>
                            <p>{user.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">이름</p>
                            <p>{user.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">상태</p>
                            <Badge variant={user.status.toLowerCase() === 'active' ? 'default' : 'secondary'}>
                                {user.status}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">생성일</p>
                            <p>{new Date(user.createdAt).toLocaleString('ko-KR')}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Wallet Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        지갑 잔액
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAdjustForm(!showAdjustForm)}
                    >
                        잔액 조정
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4">
                        {balance !== null ? (
                            <span className="text-4xl font-bold text-primary">
                                ₩{balance.toLocaleString()}
                            </span>
                        ) : (
                            <span className="text-muted-foreground">지갑 정보 없음</span>
                        )}
                    </div>

                    {showAdjustForm && (
                        <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    value={adjustAmount}
                                    onChange={(e) => setAdjustAmount(e.target.value)}
                                    placeholder="금액 (음수: 차감, 양수: 충전)"
                                    className="flex-1"
                                />
                                <Input
                                    value={adjustReason}
                                    onChange={(e) => setAdjustReason(e.target.value)}
                                    placeholder="조정 사유"
                                    className="flex-1"
                                />
                                <Button onClick={handleAdjustBalance} disabled={adjusting}>
                                    {adjusting ? '처리중...' : '적용'}
                                </Button>
                                <Button variant="outline" onClick={() => setShowAdjustForm(false)}>
                                    취소
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>거래 내역</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">날짜</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">유형</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">가맹점</th>
                                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">금액</th>
                                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">잔액</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-muted-foreground">
                                            거래 내역이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map(tx => (
                                        <tr key={tx.id} className="border-b border-border">
                                            <td className="py-3 px-4">{new Date(tx.createdAt).toLocaleString('ko-KR')}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant={getTxTypeVariant(tx.txType)}>
                                                    {getTxTypeLabel(tx.txType)}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">{tx.merchantName || '-'}</td>
                                            <td className={`py-3 px-4 text-right font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.amount >= 0 ? '+' : ''}₩{tx.amount.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-right">₩{tx.balanceAfter.toLocaleString()}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline">{tx.txStatus}</Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

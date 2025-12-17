import { useState, useCallback } from 'react';
import { transactionsApi, type Transaction } from '../api/transactions';
import { usersApi, formatPhoneToE164 } from '../api/users';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { Search, RefreshCw } from 'lucide-react';

export function TransactionHistory() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [searchType, setSearchType] = useState<'userId' | 'phone'>('phone');
    const [searched, setSearched] = useState(false);
    const [foundUserId, setFoundUserId] = useState<string | null>(null);

    const loadTransactions = useCallback(async (uid: string) => {
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

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchValue.trim()) {
            alert(searchType === 'phone' ? '전화번호를 입력해주세요.' : '사용자 ID를 입력해주세요.');
            return;
        }

        if (searchType === 'phone') {
            // Search by phone number - first find the user
            setLoading(true);
            setSearched(true);
            try {
                const formattedPhone = formatPhoneToE164(searchValue);
                const response = await usersApi.getUsers({ search: formattedPhone });

                if (response.users.length > 0) {
                    const userId = response.users[0].id;
                    setFoundUserId(userId);
                    await loadTransactions(userId);
                } else {
                    setTransactions([]);
                    setFoundUserId(null);
                    alert('해당 전화번호로 등록된 사용자를 찾을 수 없습니다.');
                }
            } catch (error) {
                console.error("Failed to find user by phone", error);
                setTransactions([]);
                setFoundUserId(null);
            } finally {
                setLoading(false);
            }
        } else {
            // Search directly by userId
            setFoundUserId(searchValue);
            await loadTransactions(searchValue);
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">거래 내역</h2>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <Select value={searchType} onValueChange={(v) => setSearchType(v as 'userId' | 'phone')}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="phone">전화번호</SelectItem>
                            <SelectItem value="userId">사용자 ID</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder={searchType === 'phone' ? '01012345678' : '사용자 ID (UUID)'}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="w-64"
                    />
                    <Button type="submit" disabled={loading}>
                        <Search className="h-4 w-4 mr-2" />
                        검색
                    </Button>
                </form>
            </div>

            {foundUserId && (
                <div className="text-sm text-muted-foreground">
                    조회된 사용자 ID: <span className="font-mono">{foundUserId}</span>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>거래 목록</CardTitle>
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
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">통화</th>
                                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">잔액</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8">
                                            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </td>
                                    </tr>
                                ) : !searched ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-muted-foreground">
                                            사용자 ID를 입력하고 검색하세요.
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-muted-foreground">
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
                                                {tx.currency !== 'KRW' && (
                                                    <div className="text-xs text-muted-foreground font-normal mt-0.5">
                                                        ({tx.currency} {tx.originalAmount.toLocaleString()})
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">{tx.currency}</td>
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

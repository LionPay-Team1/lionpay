import { useEffect, useState } from 'react';
import { adminWalletApi } from '../api/client';
import { useRefresh } from '../contexts/RefreshContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Store, Receipt, Coins, RefreshCw } from 'lucide-react';

interface SummaryData {
    totalWallets: number;
    totalMerchants: number;
    totalTransactions: number;
    activeCurrencies: number;
}

export function Home() {
    const { refreshKey } = useRefresh();
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSummary = async () => {
            setLoading(true);
            try {
                const response = await adminWalletApi.apiV1WalletAdminSummaryGet();
                setSummary(response.data as unknown as SummaryData);
            } catch (error) {
                console.error("Failed to load summary", error);
            } finally {
                setLoading(false);
            }
        };

        loadSummary();
    }, [refreshKey]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                데이터를 불러올 수 없습니다.
            </div>
        );
    }

    const cards = [
        {
            title: "총 지갑 (사용자)",
            value: summary.totalWallets,
            icon: Users,
            color: "text-blue-500"
        },
        {
            title: "가맹점 수",
            value: summary.totalMerchants,
            icon: Store,
            color: "text-green-500"
        },
        {
            title: "총 거래 수",
            value: summary.totalTransactions,
            icon: Receipt,
            color: "text-orange-500"
        },
        {
            title: "활성 통화",
            value: summary.activeCurrencies,
            icon: Coins,
            color: "text-purple-500"
        }
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">서비스 요약</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {card.title}
                            </CardTitle>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {card.value.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

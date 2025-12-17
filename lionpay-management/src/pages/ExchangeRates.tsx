import { useEffect, useState, useCallback } from 'react';
import { exchangeRatesApi, type ExchangeRate, type ExchangeRateHistory, type Currency } from '../api/exchangeRates';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Field, FieldLabel } from '../components/ui/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { Plus, Save, X, History, RefreshCw } from 'lucide-react';

export function ExchangeRates() {
    const [rates, setRates] = useState<ExchangeRate[]>([]);
    const [history, setHistory] = useState<ExchangeRateHistory[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null);
    const [newRate, setNewRate] = useState('');
    const [saving, setSaving] = useState(false);

    // For adding new rate
    const [showAddForm, setShowAddForm] = useState(false);
    const [newSourceCurrency, setNewSourceCurrency] = useState('');
    const [newTargetCurrency, setNewTargetCurrency] = useState('');
    const [newRateValue, setNewRateValue] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [ratesData, currenciesData] = await Promise.all([
                exchangeRatesApi.getAll(),
                exchangeRatesApi.getCurrencies()
            ]);
            setRates(ratesData);
            setCurrencies(currenciesData);
        } catch (error) {
            console.error('Failed to load exchange rates', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadHistory = useCallback(async () => {
        try {
            const historyData = await exchangeRatesApi.getHistory(undefined, undefined, 50);
            setHistory(historyData);
        } catch (error) {
            console.error('Failed to load history', error);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (showHistory) {
            loadHistory();
        }
    }, [showHistory, loadHistory]);

    const handleEdit = (rate: ExchangeRate) => {
        setEditingRate(rate);
        setNewRate(rate.rate.toString());
    };

    const handleSave = async () => {
        if (!editingRate || !newRate) return;

        setSaving(true);
        try {
            await exchangeRatesApi.update(
                editingRate.sourceCurrency,
                editingRate.targetCurrency,
                parseFloat(newRate)
            );
            setEditingRate(null);
            setNewRate('');
            await loadData();
        } catch (error) {
            console.error('Failed to update rate', error);
            alert('환율 업데이트에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handleAddRate = async () => {
        if (!newSourceCurrency || !newTargetCurrency || !newRateValue) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        setSaving(true);
        try {
            await exchangeRatesApi.update(
                newSourceCurrency.toUpperCase(),
                newTargetCurrency.toUpperCase(),
                parseFloat(newRateValue)
            );
            setShowAddForm(false);
            setNewSourceCurrency('');
            setNewTargetCurrency('');
            setNewRateValue('');
            await loadData();
        } catch (error) {
            console.error('Failed to add rate', error);
            alert('환율 추가에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">환율 관리</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowHistory(!showHistory)}>
                        <History className="h-4 w-4 mr-2" />
                        {showHistory ? '히스토리 숨기기' : '히스토리 보기'}
                    </Button>
                    <Button onClick={() => setShowAddForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        환율 추가
                    </Button>
                </div>
            </div>

            {/* Add New Rate Form */}
            {showAddForm && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>새 환율 추가</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <Field>
                                <FieldLabel>기준 통화</FieldLabel>
                                <Select value={newSourceCurrency} onValueChange={setNewSourceCurrency}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="통화 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currencies.map(c => (
                                            <SelectItem key={c.currencyCode} value={c.currencyCode}>
                                                {c.currencyCode} - {c.currencyName} {c.symbol && `(${c.symbol})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel>대상 통화</FieldLabel>
                                <Select value={newTargetCurrency} onValueChange={setNewTargetCurrency}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="통화 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currencies.map(c => (
                                            <SelectItem key={c.currencyCode} value={c.currencyCode}>
                                                {c.currencyCode} - {c.currencyName} {c.symbol && `(${c.symbol})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel>환율</FieldLabel>
                                <Input
                                    type="number"
                                    step="0.0000000001"
                                    value={newRateValue}
                                    onChange={(e) => setNewRateValue(e.target.value)}
                                    placeholder="환율 입력"
                                />
                            </Field>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowAddForm(false)}>취소</Button>
                            <Button onClick={handleAddRate} disabled={saving}>
                                {saving ? '저장 중...' : '추가'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Available Currencies */}
            <Card>
                <CardHeader>
                    <CardTitle>지원 통화 (ISO 4217)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {currencies.map(c => (
                            <Badge key={c.currencyCode} variant="secondary" className="px-3 py-1">
                                {c.symbol && <span className="font-bold text-primary mr-1">{c.symbol}</span>}
                                <span className="font-semibold">{c.currencyCode}</span>
                                <span className="ml-1 text-muted-foreground">{c.currencyName}</span>
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Exchange Rates Table */}
            <Card>
                <CardHeader>
                    <CardTitle>환율 목록</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">기준</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">대상</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">환율</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">유형</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">소스</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">업데이트</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">액션</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8">
                                            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </td>
                                    </tr>
                                ) : rates.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-muted-foreground">
                                            등록된 환율이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    rates.map(rate => (
                                        <tr key={rate.id} className="border-b border-border">
                                            <td className="py-3 px-4">
                                                <Badge variant="outline" className="font-semibold">
                                                    {rate.sourceCurrency}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline" className="font-semibold">
                                                    {rate.targetCurrency}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                {editingRate?.id === rate.id ? (
                                                    <Input
                                                        type="number"
                                                        step="0.0000000001"
                                                        value={newRate}
                                                        onChange={(e) => setNewRate(e.target.value)}
                                                        className="w-40"
                                                    />
                                                ) : (
                                                    <span className="font-mono font-semibold">
                                                        {rate.rate.toFixed(10).replace(/\.?0+$/, '')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant="default">{rate.rateType}</Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant="secondary">{rate.source}</Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                {new Date(rate.updatedAt).toLocaleString('ko-KR')}
                                            </td>
                                            <td className="py-3 px-4">
                                                {editingRate?.id === rate.id ? (
                                                    <div className="flex gap-1">
                                                        <Button size="sm" onClick={handleSave} disabled={saving}>
                                                            <Save className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => setEditingRate(null)}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button size="sm" variant="outline" onClick={() => handleEdit(rate)}>
                                                        수정
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* History Section */}
            {showHistory && (
                <Card>
                    <CardHeader>
                        <CardTitle>환율 변경 히스토리</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">통화</th>
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">이전 환율</th>
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">새 환율</th>
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">변동</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">변경일</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-8 text-muted-foreground">
                                                변경 내역이 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        history.map(h => {
                                            const change = h.oldRate ? ((h.newRate - h.oldRate) / h.oldRate * 100) : null;
                                            return (
                                                <tr key={h.id} className="border-b border-border">
                                                    <td className="py-3 px-4">
                                                        <Badge variant="outline" className="mr-1">{h.sourceCurrency}</Badge>
                                                        →
                                                        <Badge variant="outline" className="ml-1">{h.targetCurrency}</Badge>
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-mono">
                                                        {h.oldRate?.toFixed(6) ?? 'N/A'}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-mono">
                                                        {h.newRate.toFixed(6)}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        {change !== null && (
                                                            <span className={`font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {new Date(h.changedAt).toLocaleString('ko-KR')}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

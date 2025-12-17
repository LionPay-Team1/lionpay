import { useEffect, useState, useCallback } from 'react';
import { merchantsApi, type Merchant, MerchantStatus } from '../api/merchants';
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
import { Plus, Edit2, X } from 'lucide-react';

export function Merchants() {
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
    const [saving, setSaving] = useState(false);

    // Form states
    const [formName, setFormName] = useState('');
    const [formCountry, setFormCountry] = useState('');
    const [formCategory, setFormCategory] = useState('');
    const [formStatus, setFormStatus] = useState<MerchantStatus>(MerchantStatus.Active);

    const loadMerchants = useCallback(async () => {
        setLoading(true);
        try {
            const data = await merchantsApi.getAll();
            setMerchants(data);
        } catch (error) {
            console.error('Failed to load merchants', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMerchants();
    }, [loadMerchants]);

    const resetForm = () => {
        setFormName('');
        setFormCountry('');
        setFormCategory('');
        setFormStatus(MerchantStatus.Active);
        setEditingMerchant(null);
        setShowAddForm(false);
    };

    const handleEdit = (merchant: Merchant) => {
        setEditingMerchant(merchant);
        setFormName(merchant.name);
        setFormCountry(merchant.countryCode);
        setFormCategory(merchant.category);
        setFormStatus(merchant.status);
        setShowAddForm(true);
    };

    const handleSubmit = async () => {
        if (!formName || !formCountry || !formCategory) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        setSaving(true);
        try {
            if (editingMerchant) {
                await merchantsApi.update(editingMerchant.id, {
                    merchantName: formName,
                    merchantCategory: formCategory,
                    merchantStatus: formStatus
                });
            } else {
                await merchantsApi.create({
                    merchantName: formName,
                    countryCode: formCountry,
                    merchantCategory: formCategory
                });
            }
            resetForm();
            await loadMerchants();
        } catch (error) {
            console.error('Failed to save merchant', error);
            alert('가맹점 저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'default';
            case 'inactive':
                return 'secondary';
            case 'suspended':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">가맹점 관리</h2>
                <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    가맹점 추가
                </Button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{editingMerchant ? '가맹점 수정' : '새 가맹점 추가'}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={resetForm}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <Field>
                                <FieldLabel>가맹점 이름</FieldLabel>
                                <Input
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="가맹점 이름 입력"
                                />
                            </Field>
                            <Field>
                                <FieldLabel>국가 코드</FieldLabel>
                                <Input
                                    value={formCountry}
                                    onChange={(e) => setFormCountry(e.target.value)}
                                    placeholder="예: KR, JP, US"
                                    disabled={!!editingMerchant}
                                />
                            </Field>
                            <Field>
                                <FieldLabel>카테고리</FieldLabel>
                                <Input
                                    value={formCategory}
                                    onChange={(e) => setFormCategory(e.target.value)}
                                    placeholder="예: Restaurant, Retail"
                                />
                            </Field>
                            {editingMerchant && (
                                <Field>
                                    <FieldLabel>상태</FieldLabel>
                                    <Select value={formStatus} onValueChange={(val) => setFormStatus(val as MerchantStatus)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={MerchantStatus.Active}>Active</SelectItem>
                                            <SelectItem value={MerchantStatus.Inactive}>Inactive</SelectItem>
                                            <SelectItem value={MerchantStatus.Suspended}>Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={resetForm}>
                                취소
                            </Button>
                            <Button onClick={handleSubmit} disabled={saving}>
                                {saving ? '저장 중...' : editingMerchant ? '수정' : '생성'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Merchants Table */}
            <Card>
                <CardHeader>
                    <CardTitle>가맹점 목록</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">이름</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">국가</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">카테고리</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">상태</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">생성일</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">액션</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-muted-foreground">
                                            로딩 중...
                                        </td>
                                    </tr>
                                ) : merchants.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-muted-foreground">
                                            등록된 가맹점이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    merchants.map(merchant => (
                                        <tr key={merchant.id} className="border-b border-border">
                                            <td className="py-3 px-4 font-medium">{merchant.name}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline" className="font-semibold">
                                                    {merchant.countryCode}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">{merchant.category}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant={getStatusVariant(merchant.status)}>
                                                    {merchant.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                {new Date(merchant.createdAt).toLocaleDateString('ko-KR')}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(merchant)}
                                                >
                                                    <Edit2 className="h-4 w-4 mr-1" />
                                                    수정
                                                </Button>
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

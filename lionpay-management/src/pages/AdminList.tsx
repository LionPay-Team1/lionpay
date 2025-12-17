import { useState, useEffect, useCallback } from 'react';
import { adminsApi, type Admin, type AdminCreateParams, type AdminUpdateParams } from '../api/admins';
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
import { RefreshCw, Plus, Shield, Edit2, X } from 'lucide-react';

export function AdminList() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
    const [formData, setFormData] = useState<AdminCreateParams>({
        username: '',
        password: '',
        name: ''
    });
    const [editFormData, setEditFormData] = useState<AdminUpdateParams>({
        name: '',
        password: '',
        role: undefined
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadAdmins = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await adminsApi.getAll();
            setAdmins(data);
        } catch (e) {
            console.error("Failed to load admins", e);
            setError('관리자 목록을 불러오는데 실패했습니다. SUPER_ADMIN 권한이 필요합니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAdmins();
    }, [loadAdmins]);

    const resetForm = () => {
        setShowForm(false);
        setEditingAdmin(null);
        setFormData({ username: '', password: '', name: '' });
        setEditFormData({ name: '', password: '', role: undefined });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await adminsApi.create(formData);
            resetForm();
            await loadAdmins();
        } catch (e) {
            console.error("Failed to create admin", e);
            setError('관리자 생성에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (admin: Admin) => {
        setEditingAdmin(admin);
        setEditFormData({
            name: admin.name,
            password: '',
            role: admin.role as 'ADMIN' | 'SUPER_ADMIN'
        });
        setShowForm(false);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAdmin) return;

        setSaving(true);
        setError(null);
        try {
            const updateData: AdminUpdateParams = {};
            if (editFormData.name && editFormData.name !== editingAdmin.name) {
                updateData.name = editFormData.name;
            }
            if (editFormData.password) {
                updateData.password = editFormData.password;
            }
            if (editFormData.role && editFormData.role !== editingAdmin.role) {
                updateData.role = editFormData.role;
            }

            await adminsApi.update(editingAdmin.id, updateData);
            resetForm();
            await loadAdmins();
        } catch (e) {
            console.error("Failed to update admin", e);
            setError('관리자 수정에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const getRoleBadge = (role: string) => {
        if (role === 'SUPER_ADMIN') {
            return <Badge variant="destructive">{role}</Badge>;
        }
        return <Badge variant="secondary">{role}</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">관리자 관리</h2>
                <div className="flex gap-2">
                    <Button onClick={loadAdmins} variant="outline" disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        새로고침
                    </Button>
                    <Button onClick={() => { resetForm(); setShowForm(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        관리자 추가
                    </Button>
                </div>
            </div>

            {error && (
                <div className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            {/* Create Form */}
            {showForm && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>새 관리자 등록</CardTitle>
                        <Button variant="ghost" size="icon" onClick={resetForm}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <Field>
                                    <FieldLabel>아이디</FieldLabel>
                                    <Input
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="admin_id"
                                        required
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel>비밀번호</FieldLabel>
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        required
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel>이름</FieldLabel>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="관리자 이름"
                                        required
                                    />
                                </Field>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={saving}>
                                    {saving ? '저장 중...' : '등록'}
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    취소
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Edit Form */}
            {editingAdmin && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>관리자 수정: {editingAdmin.username}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={resetForm}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <Field>
                                    <FieldLabel>이름</FieldLabel>
                                    <Input
                                        value={editFormData.name || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                        placeholder="관리자 이름"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel>새 비밀번호 (변경 시에만 입력)</FieldLabel>
                                    <Input
                                        type="password"
                                        value={editFormData.password || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel>역할</FieldLabel>
                                    <Select
                                        value={editFormData.role}
                                        onValueChange={(v) => setEditFormData({ ...editFormData, role: v as 'ADMIN' | 'SUPER_ADMIN' })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                                            <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={saving}>
                                    {saving ? '저장 중...' : '수정'}
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    취소
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        관리자 목록
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">아이디</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">이름</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">역할</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">등록일</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">액션</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8">
                                            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </td>
                                    </tr>
                                ) : admins.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                                            관리자가 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    admins.map(admin => (
                                        <tr key={admin.id} className="border-b border-border">
                                            <td className="py-3 px-4 font-medium">{admin.username}</td>
                                            <td className="py-3 px-4">{admin.name}</td>
                                            <td className="py-3 px-4">{getRoleBadge(admin.role)}</td>
                                            <td className="py-3 px-4">
                                                {new Date(admin.createdAt).toLocaleDateString('ko-KR')}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(admin)}
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

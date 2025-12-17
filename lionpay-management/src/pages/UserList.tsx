import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi, type User } from '../api/users';
import { useRefresh } from '../contexts/RefreshContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export function UserList() {
    const navigate = useNavigate();
    const { refreshKey } = useRefresh();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const loadUsers = useCallback(async (query: string, pageNum: number) => {
        setLoading(true);
        try {
            const response = await usersApi.getUsers({
                search: query || undefined,
                page: pageNum,
                size: 20
            });
            setUsers(response.users);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers(searchQuery, page);
    }, [loadUsers, page, refreshKey, searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        setSearchQuery(search);
    };

    const handleViewDetail = (user: User) => {
        navigate(`/users/${user.id}`);
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
                <h2 className="text-2xl font-bold">사용자 관리</h2>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                        placeholder="전화번호로 검색..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64"
                    />
                    <Button type="submit" variant="secondary">
                        <Search className="h-4 w-4 mr-2" />
                        검색
                    </Button>
                </form>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>사용자 목록</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">전화번호</th>
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">이름</th>
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
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-muted-foreground">
                                            사용자가 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map(user => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                                            onClick={() => handleViewDetail(user)}
                                        >
                                            <td className="py-3 px-4 font-mono text-sm" title={user.id}>
                                                {user.id.slice(0, 8)}...
                                            </td>
                                            <td className="py-3 px-4">{user.phone}</td>
                                            <td className="py-3 px-4">{user.name}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant={getStatusVariant(user.status)}>
                                                    {user.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                                            </td>
                                            <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewDetail(user)}
                                                >
                                                    상세보기
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 0}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                이전
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                {page + 1} / {totalPages} 페이지
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(p => p + 1)}
                            >
                                다음
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

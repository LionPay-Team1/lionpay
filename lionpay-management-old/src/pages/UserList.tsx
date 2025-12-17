import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi, type User } from '../api/users';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
    loadUsers(search, page);
  }, [loadUsers, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadUsers(search, 0);
  };

  const handleViewDetail = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>User Management</h2>
        <form onSubmit={handleSearch} className="search-form">
          <Input
            placeholder="Search by phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Phone</th>
              <th>Name</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="text-center">No users found.</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id} onClick={() => handleViewDetail(user)} style={{ cursor: 'pointer' }}>
                  <td className="id-cell" title={user.id}>{user.id.slice(0, 8)}...</td>
                  <td>{user.phone}</td>
                  <td>{user.name}</td>
                  <td>
                    <span className={`status-badge ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('ko-KR')}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="secondary"
                      className="btn-sm"
                      onClick={() => handleViewDetail(user)}
                    >
                      View Detail
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <Button
            variant="secondary"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="page-info">Page {page + 1} of {totalPages}</span>
          <Button
            variant="secondary"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <style>{`
        .id-cell {
          font-family: monospace;
          font-size: 0.875rem;
        }
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 1rem;
        }
        .page-info {
          color: var(--text-secondary, #a0a0a0);
        }
        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
}


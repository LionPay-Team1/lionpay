import React, { useEffect, useState } from 'react';
import { usersApi, type User } from '../api/users';
import { walletApi } from '../api/wallet';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getUsers({ search });
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoading(false);
    }
  };

  const viewPoints = async (user: User) => {
    try {
      const res = await walletApi.getUserBalance(user.id);
      // 간단한 UI: alert로 잔액 표시
      alert(`${user.name}님의 잔액: ${res.balance} ${res.currency ?? ''}`);
    } catch (err) {
      console.error('Failed to fetch balance', err);
      alert('잔액 조회에 실패했습니다. 백엔드가 동작하지 않으면 모의 데이터가 표시됩니다.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>User Management</h2>
        <form onSubmit={handleSearch} className="search-form">
          <Input 
            placeholder="Search users..." 
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
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Joined At</th>
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
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`status-badge ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{new Date(user.joinedAt).toLocaleDateString()}</td>
                  <td>
                    <Button variant="secondary" className="btn-sm" onClick={() => viewPoints(user)}>View Points</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

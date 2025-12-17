import React, { useEffect, useState, useCallback } from 'react';
import { merchantsApi, type Merchant } from '../api/merchants';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

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
    const [formStatus, setFormStatus] = useState('Active');

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
        setFormStatus('Active');
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Merchant Management</h2>
                <Button variant="primary" onClick={() => setShowAddForm(true)}>
                    Add Merchant
                </Button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <div className="card" style={{ marginBottom: '1rem' }}>
                    <h3>{editingMerchant ? 'Edit Merchant' : 'Add New Merchant'}</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Merchant Name</label>
                            <Input
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder="Enter merchant name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Country Code</label>
                            <Input
                                value={formCountry}
                                onChange={(e) => setFormCountry(e.target.value)}
                                placeholder="e.g., KR, JP, US"
                                disabled={!!editingMerchant}
                            />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <Input
                                value={formCategory}
                                onChange={(e) => setFormCategory(e.target.value)}
                                placeholder="e.g., Restaurant, Retail"
                            />
                        </div>
                        {editingMerchant && (
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={formStatus}
                                    onChange={(e) => setFormStatus(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="form-actions">
                        <Button variant="secondary" onClick={resetForm}>Cancel</Button>
                        <Button variant="primary" onClick={handleSubmit} disabled={saving}>
                            {saving ? 'Saving...' : editingMerchant ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Merchants Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Country</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="text-center">Loading...</td></tr>
                        ) : merchants.length === 0 ? (
                            <tr><td colSpan={6} className="text-center">No merchants found.</td></tr>
                        ) : (
                            merchants.map(merchant => (
                                <tr key={merchant.id}>
                                    <td>{merchant.name}</td>
                                    <td><span className="country-badge">{merchant.countryCode}</span></td>
                                    <td>{merchant.category}</td>
                                    <td>
                                        <span className={`status-badge ${merchant.status.toLowerCase()}`}>
                                            {merchant.status}
                                        </span>
                                    </td>
                                    <td>{formatDate(merchant.createdAt)}</td>
                                    <td>
                                        <Button
                                            variant="secondary"
                                            className="btn-sm"
                                            onClick={() => handleEdit(merchant)}
                                        >
                                            Edit
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-secondary, #a0a0a0);
        }
        .form-select {
          width: 100%;
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid var(--border-color, #333);
          background: var(--bg-tertiary, #0a0a1a);
          color: var(--text-primary, #fff);
        }
        .form-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }
        .country-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: var(--primary-bg, rgba(100, 108, 255, 0.1));
          color: var(--primary, #646cff);
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.875rem;
        }
        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
        }
      `}</style>
        </div>
    );
}

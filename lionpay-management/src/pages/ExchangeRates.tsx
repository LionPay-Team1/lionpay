import React, { useEffect, useState, useCallback } from 'react';
import { exchangeRatesApi, type ExchangeRate, type ExchangeRateHistory, type Currency } from '../api/exchangeRates';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ko-KR');
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Exchange Rate Management</h2>
                <div className="header-actions">
                    <Button
                        variant="secondary"
                        onClick={() => setShowHistory(!showHistory)}
                    >
                        {showHistory ? 'Hide History' : 'Show History'}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => setShowAddForm(true)}
                    >
                        Add Rate
                    </Button>
                </div>
            </div>

            {/* Add New Rate Form */}
            {showAddForm && (
                <div className="card" style={{ marginBottom: '1rem' }}>
                    <h3>Add New Exchange Rate</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Source Currency</label>
                            <select
                                value={newSourceCurrency}
                                onChange={(e) => setNewSourceCurrency(e.target.value)}
                                className="form-select"
                            >
                                <option value="">Select currency</option>
                                {currencies.map(c => (
                                    <option key={c.currencyCode} value={c.currencyCode}>
                                        {c.currencyCode} - {c.currencyName} {c.symbol && `(${c.symbol})`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Target Currency</label>
                            <select
                                value={newTargetCurrency}
                                onChange={(e) => setNewTargetCurrency(e.target.value)}
                                className="form-select"
                            >
                                <option value="">Select currency</option>
                                {currencies.map(c => (
                                    <option key={c.currencyCode} value={c.currencyCode}>
                                        {c.currencyCode} - {c.currencyName} {c.symbol && `(${c.symbol})`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Rate</label>
                            <Input
                                type="number"
                                step="0.0000000001"
                                value={newRateValue}
                                onChange={(e) => setNewRateValue(e.target.value)}
                                placeholder="Enter rate"
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <Button variant="secondary" onClick={() => setShowAddForm(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleAddRate} disabled={saving}>
                            {saving ? 'Saving...' : 'Add Rate'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Available Currencies */}
            <div className="card" style={{ marginBottom: '1rem' }}>
                <h3>Available Currencies (ISO 4217)</h3>
                <div className="currency-chips">
                    {currencies.map(c => (
                        <span key={c.currencyCode} className="currency-chip">
                            {c.symbol && <span className="symbol">{c.symbol}</span>}
                            <span className="code">{c.currencyCode}</span>
                            <span className="name">{c.currencyName}</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* Exchange Rates Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Source</th>
                            <th>Target</th>
                            <th>Rate</th>
                            <th>Type</th>
                            <th>Source</th>
                            <th>Updated At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center">Loading...</td></tr>
                        ) : rates.length === 0 ? (
                            <tr><td colSpan={7} className="text-center">No exchange rates found.</td></tr>
                        ) : (
                            rates.map(rate => (
                                <tr key={rate.id}>
                                    <td><span className="currency-badge">{rate.sourceCurrency}</span></td>
                                    <td><span className="currency-badge">{rate.targetCurrency}</span></td>
                                    <td>
                                        {editingRate?.id === rate.id ? (
                                            <Input
                                                type="number"
                                                step="0.0000000001"
                                                value={newRate}
                                                onChange={(e) => setNewRate(e.target.value)}
                                                className="rate-input"
                                            />
                                        ) : (
                                            <span className="rate-value">{rate.rate.toFixed(10).replace(/\.?0+$/, '')}</span>
                                        )}
                                    </td>
                                    <td><span className="badge">{rate.rateType}</span></td>
                                    <td><span className="badge secondary">{rate.source}</span></td>
                                    <td>{formatDate(rate.updatedAt)}</td>
                                    <td>
                                        {editingRate?.id === rate.id ? (
                                            <>
                                                <Button variant="primary" className="btn-sm" onClick={handleSave} disabled={saving}>
                                                    {saving ? '...' : 'Save'}
                                                </Button>
                                                <Button variant="secondary" className="btn-sm" onClick={() => setEditingRate(null)}>
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <Button variant="secondary" className="btn-sm" onClick={() => handleEdit(rate)}>
                                                Edit
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* History Section */}
            {showHistory && (
                <div className="history-section" style={{ marginTop: '2rem' }}>
                    <h3>Rate Change History</h3>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Currencies</th>
                                    <th>Old Rate</th>
                                    <th>New Rate</th>
                                    <th>Change</th>
                                    <th>Changed At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center">No history found.</td></tr>
                                ) : (
                                    history.map(h => {
                                        const change = h.oldRate ? ((h.newRate - h.oldRate) / h.oldRate * 100) : null;
                                        return (
                                            <tr key={h.id}>
                                                <td>
                                                    <span className="currency-badge">{h.sourceCurrency}</span>
                                                    {' → '}
                                                    <span className="currency-badge">{h.targetCurrency}</span>
                                                </td>
                                                <td>{h.oldRate?.toFixed(6) ?? 'N/A'}</td>
                                                <td>{h.newRate.toFixed(6)}</td>
                                                <td>
                                                    {change !== null && (
                                                        <span className={`change ${change >= 0 ? 'positive' : 'negative'}`}>
                                                            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                                                        </span>
                                                    )}
                                                </td>
                                                <td>{formatDate(h.changedAt)}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <style>{`
        .header-actions {
          display: flex;
          gap: 0.5rem;
        }
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
          grid-template-columns: repeat(3, 1fr);
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
        .currency-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .currency-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.375rem 0.75rem;
          background: var(--bg-tertiary, #0a0a1a);
          border-radius: 20px;
          font-size: 0.875rem;
        }
        .currency-chip .symbol {
          font-weight: bold;
          color: var(--primary, #646cff);
        }
        .currency-chip .code {
          font-weight: 600;
        }
        .currency-chip .name {
          color: var(--text-secondary, #a0a0a0);
          font-size: 0.75rem;
        }
        .currency-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: var(--primary-bg, rgba(100, 108, 255, 0.1));
          color: var(--primary, #646cff);
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.875rem;
        }
        .rate-value {
          font-family: monospace;
          font-weight: 600;
        }
        .rate-input {
          width: 150px;
        }
        .badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: var(--success-bg, rgba(76, 175, 80, 0.1));
          color: var(--success, #4caf50);
          border-radius: 4px;
          font-size: 0.75rem;
          text-transform: uppercase;
        }
        .badge.secondary {
          background: var(--bg-tertiary, #0a0a1a);
          color: var(--text-secondary, #a0a0a0);
        }
        .change {
          font-weight: 600;
        }
        .change.positive {
          color: var(--success, #4caf50);
        }
        .change.negative {
          color: var(--error, #f44336);
        }
        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          margin-right: 0.25rem;
        }
      `}</style>
        </div>
    );
}

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { payoutAPI, vendorAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { PageLoader } from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { FiPlus, FiFilter, FiChevronRight, FiX } from 'react-icons/fi';

const STATUSES = ['Draft', 'Submitted', 'Approved', 'Rejected'];

const PayoutsPage = () => {
  const { isOPS } = useAuth();
  const [payouts, setPayouts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', vendor_id: '' });
  const [appliedFilters, setAppliedFilters] = useState({ status: '', vendor_id: '' });

  const fetchPayouts = useCallback(async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await payoutAPI.getAll({ ...params, limit: 20 });
      setPayouts(data.data.payouts);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payouts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayouts();
    vendorAPI.getAll().then(({ data }) => setVendors(data.data.vendors)).catch(() => {});
  }, [fetchPayouts]);

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.vendor_id) params.vendor_id = filters.vendor_id;
    fetchPayouts(params);
  };

  const clearFilters = () => {
    setFilters({ status: '', vendor_id: '' });
    setAppliedFilters({ status: '', vendor_id: '' });
    fetchPayouts();
  };

  const hasActiveFilters = appliedFilters.status || appliedFilters.vendor_id;
  const formatAmount = (a) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(a);
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="page-layout">
      <Navbar />
      <main className="page-main">
        <div className="page-header">
          <div>
            <h1 className="page-title">Payouts</h1>
            <p className="page-subtitle">{pagination.total} total{hasActiveFilters && ' (filtered)'}</p>
          </div>
          {isOPS && (
            <Link to="/payouts/new" className="btn btn--primary" id="create-payout-btn">
              <FiPlus /> New Payout
            </Link>
          )}
        </div>

        <div className="filter-bar">
          <div className="filter-bar__inner">
            <FiFilter className="filter-icon" />
            <select className="filter-select" value={filters.status}
              onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))} id="filter-status">
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="filter-select" value={filters.vendor_id}
              onChange={(e) => setFilters((p) => ({ ...p, vendor_id: e.target.value }))} id="filter-vendor">
              <option value="">All Vendors</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <button className="btn btn--secondary btn--sm" onClick={applyFilters} id="apply-filters-btn">Apply</button>
            {hasActiveFilters && (
              <button className="btn btn--ghost btn--sm" onClick={clearFilters} id="clear-filters-btn">
                <FiX /> Clear
              </button>
            )}
          </div>
        </div>

        <ErrorMessage message={error} />

        {loading ? <PageLoader /> : (
          <>
            <div className="table-container">
              <table className="data-table" id="payouts-table">
                <thead>
                  <tr>
                    <th>#</th><th>Vendor</th><th>Amount</th><th>Mode</th>
                    <th>Status</th><th>Created</th><th>Created By</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.length === 0 ? (
                    <tr><td colSpan="8" className="table-empty">
                      {hasActiveFilters ? 'No payouts match the selected filters.' : 'No payouts yet.'}
                    </td></tr>
                  ) : payouts.map((p) => (
                    <tr key={p.id}>
                      <td className="table-id">#{p.id}</td>
                      <td className="table-name">{p.vendor?.name || '—'}</td>
                      <td className="table-amount">{formatAmount(p.amount)}</td>
                      <td><span className="tag tag--mode">{p.mode}</span></td>
                      <td><StatusBadge status={p.status} /></td>
                      <td className="table-date">{formatDate(p.created_at)}</td>
                      <td>{p.creator?.name || '—'}</td>
                      <td>
                        <Link to={`/payouts/${p.id}`} className="btn-link" id={`payout-detail-${p.id}`}>
                          <FiChevronRight />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button className="btn btn--ghost btn--sm" disabled={pagination.page === 1}
                  onClick={() => fetchPayouts({ ...appliedFilters, page: pagination.page - 1 })}>← Prev</button>
                <span className="pagination-info">Page {pagination.page} of {pagination.totalPages}</span>
                <button className="btn btn--ghost btn--sm" disabled={pagination.page === pagination.totalPages}
                  onClick={() => fetchPayouts({ ...appliedFilters, page: pagination.page + 1 })}>Next →</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default PayoutsPage;

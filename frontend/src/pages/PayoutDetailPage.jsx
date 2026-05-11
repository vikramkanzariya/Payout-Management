import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { payoutAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { PageLoader } from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiSend, FiCheckCircle, FiXCircle,
  FiClock, FiUser, FiDollarSign, FiFileText, FiAlertTriangle
} from 'react-icons/fi';

const ACTION_ICONS = {
  CREATED: <FiFileText />,
  SUBMITTED: <FiSend />,
  APPROVED: <FiCheckCircle />,
  REJECTED: <FiXCircle />,
};
const ACTION_COLORS = {
  CREATED: 'audit--created',
  SUBMITTED: 'audit--submitted',
  APPROVED: 'audit--approved',
  REJECTED: 'audit--rejected',
};

const PayoutDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isOPS, isFINANCE } = useAuth();

  const [payout, setPayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const fetchPayout = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await payoutAPI.getById(id);
      setPayout(data.data.payout);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payout.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchPayout(); }, [fetchPayout]);

  const handleSubmit = async () => {
    setActionLoading('submit');
    try {
      await payoutAPI.submit(id);
      toast.success('Payout submitted for approval!');
      fetchPayout();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit payout.');
    } finally {
      setActionLoading('');
    }
  };

  const handleApprove = async () => {
    setActionLoading('approve');
    try {
      await payoutAPI.approve(id);
      toast.success('Payout approved!');
      fetchPayout();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve payout.');
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim() || rejectReason.trim().length < 5) {
      setRejectError('Reason must be at least 5 characters.');
      return;
    }
    setActionLoading('reject');
    try {
      await payoutAPI.reject(id, rejectReason.trim());
      toast.success('Payout rejected.');
      setShowRejectModal(false);
      setRejectReason('');
      fetchPayout();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject payout.');
    } finally {
      setActionLoading('');
    }
  };

  const formatAmount = (a) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(a);
  const formatDateTime = (d) =>
    new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  if (loading) return <div className="page-layout"><Navbar /><main className="page-main"><PageLoader /></main></div>;

  return (
    <div className="page-layout">
      <Navbar />
      <main className="page-main page-main--narrow">
        {/* Back + Header */}
        <div className="page-header">
          <div>
            <button className="btn-back" onClick={() => navigate('/payouts')}>
              <FiArrowLeft /> Back to Payouts
            </button>
            <h1 className="page-title">
              Payout #{id}
              <StatusBadge status={payout?.status} />
            </h1>
          </div>
        </div>

        <ErrorMessage message={error} />

        {payout && (
          <div className="detail-grid">
            {/* Left: Payout Info */}
            <div className="detail-main">
              {/* Amount Card */}
              <div className="amount-card">
                <div className="amount-card__label">Amount</div>
                <div className="amount-card__value">{formatAmount(payout.amount)}</div>
                <span className="tag tag--mode">{payout.mode}</span>
              </div>

              {/* Info Grid */}
              <div className="info-card">
                <h3 className="info-card__title">Payout Details</h3>
                <dl className="info-grid">
                  <dt><FiUser /> Vendor</dt>
                  <dd>{payout.vendor?.name || '—'}</dd>

                  {payout.vendor?.upi_id && (<><dt>UPI ID</dt><dd>{payout.vendor.upi_id}</dd></>)}
                  {payout.vendor?.bank_account && (<><dt>Bank Account</dt><dd>••••{payout.vendor.bank_account.slice(-4)}</dd></>)}
                  {payout.vendor?.ifsc && (<><dt>IFSC</dt><dd>{payout.vendor.ifsc}</dd></>)}

                  <dt><FiUser /> Created By</dt>
                  <dd>{payout.creator?.name} <span className="text-muted">({payout.creator?.role})</span></dd>

                  <dt><FiClock /> Created At</dt>
                  <dd>{formatDateTime(payout.created_at)}</dd>

                  <dt><FiClock /> Updated At</dt>
                  <dd>{formatDateTime(payout.updated_at)}</dd>

                  {payout.note && (<><dt><FiFileText /> Note</dt><dd>{payout.note}</dd></>)}
                </dl>
              </div>

              {/* Rejection Reason */}
              {payout.status === 'Rejected' && payout.decision_reason && (
                <div className="rejection-box">
                  <div className="rejection-box__header">
                    <FiAlertTriangle /> Rejection Reason
                  </div>
                  <p className="rejection-box__text">{payout.decision_reason}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="action-panel">
                {isOPS && payout.status === 'Draft' && (
                  <button
                    className="btn btn--primary btn--lg"
                    onClick={handleSubmit}
                    disabled={!!actionLoading}
                    id="submit-payout-btn"
                  >
                    {actionLoading === 'submit' ? 'Submitting...' : <><FiSend /> Submit for Approval</>}
                  </button>
                )}

                {isFINANCE && payout.status === 'Submitted' && (
                  <>
                    <button
                      className="btn btn--success btn--lg"
                      onClick={handleApprove}
                      disabled={!!actionLoading}
                      id="approve-payout-btn"
                    >
                      {actionLoading === 'approve' ? 'Approving...' : <><FiCheckCircle /> Approve Payout</>}
                    </button>
                    <button
                      className="btn btn--danger btn--lg"
                      onClick={() => setShowRejectModal(true)}
                      disabled={!!actionLoading}
                      id="reject-payout-btn"
                    >
                      <FiXCircle /> Reject Payout
                    </button>
                  </>
                )}

                {payout.status === 'Approved' && (
                  <div className="status-final status-final--approved">
                    <FiCheckCircle /> This payout has been approved.
                  </div>
                )}
                {payout.status === 'Rejected' && (
                  <div className="status-final status-final--rejected">
                    <FiXCircle /> This payout has been rejected.
                  </div>
                )}
              </div>
            </div>

            {/* Right: Audit Trail */}
            <div className="detail-sidebar">
              <div className="audit-card">
                <h3 className="audit-card__title">Audit Trail</h3>
                {!payout.audits || payout.audits.length === 0 ? (
                  <p className="text-muted">No audit history yet.</p>
                ) : (
                  <ol className="audit-timeline">
                    {payout.audits.map((a, i) => (
                      <li key={a.id} className={`audit-item ${ACTION_COLORS[a.action]}`}>
                        <div className="audit-item__icon">{ACTION_ICONS[a.action]}</div>
                        <div className="audit-item__content">
                          <span className="audit-item__action">{a.action}</span>
                          <span className="audit-item__by">
                            by {a.performed_by_name}
                            <span className="text-muted"> ({a.performed_by_role})</span>
                          </span>
                          <span className="audit-item__time">{formatDateTime(a.created_at)}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()} id="reject-modal">
            <div className="modal-header">
              <h2 className="modal-title">Reject Payout</h2>
              <button className="modal-close" onClick={() => setShowRejectModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Please provide a clear reason for rejecting this payout. This is mandatory.
              </p>
              <div className="form-group">
                <label className="form-label" htmlFor="reject-reason">
                  Rejection Reason <span className="required">*</span>
                </label>
                <textarea
                  id="reject-reason"
                  rows="4"
                  className={`form-input form-textarea ${rejectError ? 'form-input--error' : ''}`}
                  placeholder="Explain why this payout is being rejected..."
                  value={rejectReason}
                  onChange={(e) => { setRejectReason(e.target.value); setRejectError(''); }}
                />
                {rejectError && <p className="field-error">{rejectError}</p>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn--ghost" onClick={() => setShowRejectModal(false)}
                disabled={!!actionLoading}>Cancel</button>
              <button className="btn btn--danger" onClick={handleReject}
                disabled={!!actionLoading} id="confirm-reject-btn">
                {actionLoading === 'reject' ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutDetailPage;

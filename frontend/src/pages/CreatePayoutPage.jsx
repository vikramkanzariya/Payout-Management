import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { payoutAPI, vendorAPI } from '../api/client';
import Navbar from '../components/Navbar';
import ErrorMessage from '../components/ErrorMessage';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';

const MODES = ['UPI', 'IMPS', 'NEFT'];
const EMPTY = { vendor_id: '', amount: '', mode: '', note: '' };

const CreatePayoutPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    vendorAPI.getAll({ active: 'true' })
      .then(({ data }) => setVendors(data.data.vendors))
      .catch(() => toast.error('Failed to load vendors.'))
      .finally(() => setVendorsLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.vendor_id) errs.vendor_id = 'Please select a vendor.';
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0)
      errs.amount = 'Amount must be greater than 0.';
    if (!form.mode) errs.mode = 'Please select a payment mode.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      const { data } = await payoutAPI.create({
        vendor_id: form.vendor_id,
        amount: parseFloat(form.amount),
        mode: form.mode,
        note: form.note.trim() || null,
      });
      toast.success('Payout created as Draft!');
      navigate(`/payouts/${data.data.payout.id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create payout.';
      const fieldErrors = err.response?.data?.errors || [];
      if (fieldErrors.length) {
        const errMap = {};
        fieldErrors.forEach((e) => { errMap[e.field] = e.message; });
        setErrors(errMap);
      } else {
        setApiError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-layout">
      <Navbar />
      <main className="page-main page-main--narrow">
        <div className="page-header">
          <div>
            <button className="btn-back" onClick={() => navigate('/payouts')}>
              <FiArrowLeft /> Back to Payouts
            </button>
            <h1 className="page-title">Create Payout</h1>
            <p className="page-subtitle">New payout will be saved as Draft</p>
          </div>
        </div>

        <div className="form-card">
          <ErrorMessage message={apiError} />
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="p-vendor">
                Vendor <span className="required">*</span>
              </label>
              {vendorsLoading ? <Spinner size="sm" /> : (
                <select
                  id="p-vendor" name="vendor_id"
                  className={`form-input form-select ${errors.vendor_id ? 'form-input--error' : ''}`}
                  value={form.vendor_id} onChange={handleChange}
                >
                  <option value="">Select a vendor...</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              )}
              {errors.vendor_id && <p className="field-error">{errors.vendor_id}</p>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="p-amount">
                  Amount (₹) <span className="required">*</span>
                </label>
                <input
                  id="p-amount" name="amount" type="number" step="0.01" min="0.01"
                  className={`form-input ${errors.amount ? 'form-input--error' : ''}`}
                  placeholder="0.00"
                  value={form.amount} onChange={handleChange}
                />
                {errors.amount && <p className="field-error">{errors.amount}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="p-mode">
                  Payment Mode <span className="required">*</span>
                </label>
                <select
                  id="p-mode" name="mode"
                  className={`form-input form-select ${errors.mode ? 'form-input--error' : ''}`}
                  value={form.mode} onChange={handleChange}
                >
                  <option value="">Select mode...</option>
                  {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                {errors.mode && <p className="field-error">{errors.mode}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="p-note">Note (optional)</label>
              <textarea
                id="p-note" name="note" rows="3"
                className="form-input form-textarea"
                placeholder="Add any relevant notes..."
                value={form.note} onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn--ghost"
                onClick={() => navigate('/payouts')} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" disabled={loading} id="create-payout-submit">
                {loading ? <><Spinner size="sm" /> Creating...</> : 'Create Payout (Draft)'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreatePayoutPage;

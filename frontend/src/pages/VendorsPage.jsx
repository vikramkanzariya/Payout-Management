import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { vendorAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { PageLoader } from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import toast from 'react-hot-toast';
import {
  FiPlus, FiSearch, FiCheckCircle, FiXCircle,
  FiCreditCard, FiSmartphone, FiEdit2
} from 'react-icons/fi';

const VendorsPage = () => {
  const { isOPS } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editVendor, setEditVendor] = useState(null);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await vendorAPI.getAll();
      setVendors(data.data.vendors);
      setFiltered(data.data.vendors);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vendors.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      vendors.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          (v.upi_id && v.upi_id.toLowerCase().includes(q)) ||
          (v.bank_account && v.bank_account.includes(q))
      )
    );
  }, [search, vendors]);

  const openAdd = () => { setEditVendor(null); setShowModal(true); };
  const openEdit = (v) => { setEditVendor(v); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditVendor(null); };

  const handleSaved = () => { fetchVendors(); closeModal(); };

  return (
    <div className="page-layout">
      <Navbar />
      <main className="page-main">
        <div className="page-header">
          <div>
            <h1 className="page-title">Vendors</h1>
            <p className="page-subtitle">{vendors.length} vendor{vendors.length !== 1 ? 's' : ''} registered</p>
          </div>
          {isOPS && (
            <button className="btn btn--primary" onClick={openAdd} id="add-vendor-btn">
              <FiPlus /> Add Vendor
            </button>
          )}
        </div>

        {/* Search */}
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, UPI ID, or bank account..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="vendor-search"
          />
        </div>

        <ErrorMessage message={error} />

        {loading ? (
          <PageLoader />
        ) : (
          <div className="table-container">
            <table className="data-table" id="vendors-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Vendor Name</th>
                  <th>UPI ID</th>
                  <th>Bank Account</th>
                  <th>IFSC</th>
                  <th>Status</th>
                  {isOPS && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={isOPS ? 7 : 6} className="table-empty">
                      {search ? 'No vendors match your search.' : 'No vendors found. Add your first vendor!'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((v) => (
                    <tr key={v.id}>
                      <td className="table-id">#{v.id}</td>
                      <td className="table-name">{v.name}</td>
                      <td>
                        {v.upi_id ? (
                          <span className="tag tag--upi"><FiSmartphone /> {v.upi_id}</span>
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        {v.bank_account ? (
                          <span className="tag tag--bank"><FiCreditCard /> ••••{v.bank_account.slice(-4)}</span>
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td>{v.ifsc || <span className="text-muted">—</span>}</td>
                      <td>
                        {v.is_active ? (
                          <span className="status-chip status-chip--active">
                            <FiCheckCircle /> Active
                          </span>
                        ) : (
                          <span className="status-chip status-chip--inactive">
                            <FiXCircle /> Inactive
                          </span>
                        )}
                      </td>
                      {isOPS && (
                        <td>
                          <button
                            className="btn-icon btn-icon--sm"
                            onClick={() => openEdit(v)}
                            title="Edit vendor"
                          >
                            <FiEdit2 />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showModal && (
        <VendorModal
          vendor={editVendor}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

/* ─── Vendor Add/Edit Modal ─────────────────────────────────────────────────── */
const EMPTY_FORM = { name: '', upi_id: '', bank_account: '', ifsc: '', is_active: true };

const VendorModal = ({ vendor, onClose, onSaved }) => {
  const isEdit = !!vendor;
  const [form, setForm] = useState(
    isEdit
      ? {
          name: vendor.name,
          upi_id: vendor.upi_id || '',
          bank_account: vendor.bank_account || '',
          ifsc: vendor.ifsc || '',
          is_active: vendor.is_active,
        }
      : EMPTY_FORM
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Vendor name is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        upi_id: form.upi_id.trim() || null,
        bank_account: form.bank_account.trim() || null,
        ifsc: form.ifsc.trim().toUpperCase() || null,
        is_active: form.is_active,
      };
      if (isEdit) {
        await vendorAPI.update(vendor.id, payload);
        toast.success('Vendor updated successfully!');
      } else {
        await vendorAPI.create(payload);
        toast.success('Vendor created successfully!');
      }
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save vendor.';
      const fieldErrors = err.response?.data?.errors || [];
      if (fieldErrors.length) {
        const errMap = {};
        fieldErrors.forEach((e) => { errMap[e.field] = e.message; });
        setErrors(errMap);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} id="vendor-modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Vendor' : 'Add New Vendor'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="v-name">
              Vendor Name <span className="required">*</span>
            </label>
            <input
              id="v-name" name="name" type="text"
              className={`form-input ${errors.name ? 'form-input--error' : ''}`}
              placeholder="e.g. TechCorp Solutions"
              value={form.name} onChange={handleChange}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="v-upi">UPI ID</label>
              <input
                id="v-upi" name="upi_id" type="text"
                className="form-input"
                placeholder="e.g. vendor@okaxis"
                value={form.upi_id} onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="v-bank">Bank Account</label>
              <input
                id="v-bank" name="bank_account" type="text"
                className="form-input"
                placeholder="Account number"
                value={form.bank_account} onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="v-ifsc">IFSC Code</label>
              <input
                id="v-ifsc" name="ifsc" type="text"
                className={`form-input ${errors.ifsc ? 'form-input--error' : ''}`}
                placeholder="e.g. HDFC0001234"
                value={form.ifsc} onChange={handleChange}
              />
              {errors.ifsc && <p className="field-error">{errors.ifsc}</p>}
            </div>
            <div className="form-group form-group--checkbox">
              <label className="checkbox-label" htmlFor="v-active">
                <input
                  id="v-active" name="is_active" type="checkbox"
                  className="checkbox-input"
                  checked={form.is_active} onChange={handleChange}
                />
                <span className="checkbox-custom" />
                Active Vendor
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={loading} id="vendor-save-btn">
              {loading ? 'Saving...' : isEdit ? 'Update Vendor' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorsPage;

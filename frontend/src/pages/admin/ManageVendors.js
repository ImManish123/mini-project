import React, { useState, useEffect } from 'react';
import { vendorAPI, categoryAPI } from '../../services/api';
import StarRating from '../../components/common/StarRating';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaBan, FaEye } from 'react-icons/fa';

const ManageVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [form, setForm] = useState({
    name: '', categoryId: '', experienceYears: '', price: '',
    phone: '', email: '', description: '', serviceArea: '', profileImage: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [vRes, cRes] = await Promise.allSettled([vendorAPI.getAll(), categoryAPI.getAllAdmin()]);
      if (vRes.status === 'fulfilled') {
        setVendors(vRes.value.data || []);
      } else {
        console.error('Failed to load vendors:', vRes.reason);
        toast.error('Failed to load vendors');
      }
      if (cRes.status === 'fulfilled') {
        setCategories(cRes.value.data || []);
      } else {
        console.error('Failed to load categories:', cRes.reason);
        toast.error('Failed to load categories');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error loading data');
    }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, categoryId: parseInt(form.categoryId), experienceYears: parseInt(form.experienceYears), price: parseFloat(form.price) };
    try {
      if (editing) {
        await vendorAPI.update(editing, data);
        toast.success('Vendor updated');
      } else {
        await vendorAPI.create(data);
        toast.success('Vendor created');
      }
      closeModal();
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleApprove = async (id) => {
    try { await vendorAPI.approve(id); toast.success('Vendor approved'); loadData(); }
    catch (err) { toast.error('Failed'); }
  };

  const handleBlock = async (id) => {
    try { await vendorAPI.block(id); toast.success('Status updated'); loadData(); }
    catch (err) { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vendor?')) return;
    try { await vendorAPI.delete(id); toast.success('Deleted'); loadData(); }
    catch (err) { toast.error('Failed'); }
  };

  const openEdit = (v) => {
    setEditing(v.id);
    setForm({ name: v.name, categoryId: v.category?.id || '', experienceYears: v.experienceYears || '',
      price: v.price, phone: v.phone || '', email: v.email || '', description: v.description || '',
      serviceArea: v.serviceArea || '', profileImage: v.profileImage || '' });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', categoryId: categories[0]?.id || '', experienceYears: '', price: '',
      phone: '', email: '', description: '', serviceArea: '', profileImage: '' });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); };

  const filtered = filter === 'ALL' ? vendors :
    filter === 'APPROVED' ? vendors.filter(v => v.approved && !v.blocked) :
    filter === 'PENDING' ? vendors.filter(v => !v.approved) :
    vendors.filter(v => v.blocked);

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header admin-header">
        <div className="container d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold text-white">👷 Manage Vendors</h2>
            <p className="text-white opacity-75 mb-0">Approve, block, and manage service providers</p>
          </div>
          <button className="btn btn-light fw-semibold" onClick={openAdd}><FaPlus className="me-2" />Add Vendor</button>
        </div>
      </div>
      <div className="container py-5">
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {['ALL', 'APPROVED', 'PENDING', 'BLOCKED'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(f)}>{f} ({
                f === 'ALL' ? vendors.length :
                f === 'APPROVED' ? vendors.filter(v => v.approved && !v.blocked).length :
                f === 'PENDING' ? vendors.filter(v => !v.approved).length :
                vendors.filter(v => v.blocked).length
              })</button>
          ))}
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle bg-white shadow-sm rounded">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Exp</th>
                <th>Rating</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan="8" className="text-center text-muted py-4">No vendors found. Try re-logging in or check network.</td></tr>
              )}
              {filtered.map(v => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="vendor-avatar-sm me-2">{(v.name || '?').charAt(0)}</div>
                      <div>
                        <span className="fw-semibold">{v.name || 'N/A'}</span>
                        <br /><small className="text-muted">{v.serviceArea || ''}</small>
                      </div>
                    </div>
                  </td>
                  <td>{v.category?.categoryName}</td>
                  <td>{v.experienceYears} yrs</td>
                  <td><StarRating rating={v.rating} size={12} /></td>
                  <td className="fw-semibold">Rs. {v.price}</td>
                  <td>
                    {v.blocked ? <span className="badge bg-danger">Blocked</span> :
                     v.approved ? <span className="badge bg-success">Approved</span> :
                     <span className="badge bg-warning">Pending</span>}
                  </td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      {!v.approved && <button className="btn btn-sm btn-success" onClick={() => handleApprove(v.id)} title="Approve"><FaCheck /></button>}
                      <button className="btn btn-sm btn-outline-warning" onClick={() => handleBlock(v.id)} title={v.blocked ? 'Unblock' : 'Block'}>
                        <FaBan />
                      </button>
                      <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(v)}><FaEdit /></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(v.id)}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">{editing ? 'Edit Vendor' : 'Add Vendor'}</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Name</label>
                        <input type="text" className="form-control" value={form.name}
                          onChange={(e) => setForm({...form, name: e.target.value})} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Category</label>
                        <select className="form-select" value={form.categoryId}
                          onChange={(e) => setForm({...form, categoryId: e.target.value})} required>
                          <option value="">Select Category</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Experience (years)</label>
                        <input type="number" className="form-control" value={form.experienceYears}
                          onChange={(e) => setForm({...form, experienceYears: e.target.value})} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Price (Rs. )</label>
                        <input type="number" className="form-control" value={form.price}
                          onChange={(e) => setForm({...form, price: e.target.value})} required />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Phone</label>
                        <input type="text" className="form-control" value={form.phone}
                          onChange={(e) => setForm({...form, phone: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Email</label>
                        <input type="email" className="form-control" value={form.email}
                          onChange={(e) => setForm({...form, email: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Service Area</label>
                        <input type="text" className="form-control" value={form.serviceArea}
                          onChange={(e) => setForm({...form, serviceArea: e.target.value})} />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Description</label>
                        <textarea className="form-control" rows="2" value={form.description}
                          onChange={(e) => setForm({...form, description: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageVendors;

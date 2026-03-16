import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ categoryName: '', description: '', icon: '', imageUrl: '' });

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      const res = await categoryAPI.getAllAdmin();
      setCategories(res.data || []);
      if (!res.data || res.data.length === 0) {
        toast.info('No categories found');
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      toast.error(err.response?.data?.message || 'Failed to load categories. Please re-login.');
    }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await categoryAPI.update(editing, form);
        toast.success('Category updated');
      } else {
        await categoryAPI.create(form);
        toast.success('Category created');
      }
      closeModal();
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleToggle = async (id) => {
    try {
      await categoryAPI.toggle(id);
      toast.success('Status updated');
      loadCategories();
    } catch (err) { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await categoryAPI.delete(id);
      toast.success('Category deleted');
      loadCategories();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const openEdit = (cat) => {
    setEditing(cat.id);
    setForm({ categoryName: cat.categoryName, description: cat.description || '', icon: cat.icon || '', imageUrl: cat.imageUrl || '' });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ categoryName: '', description: '', icon: '', imageUrl: '' });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); };

  if (loading) return <div className="loading-screen"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header admin-header">
        <div className="container d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold text-white">📂 Manage Categories</h2>
            <p className="text-white opacity-75 mb-0">Add, edit, or remove service categories</p>
          </div>
          <button className="btn btn-light fw-semibold" onClick={openAdd}>
            <FaPlus className="me-2" />Add Category
          </button>
        </div>
      </div>
      <div className="container py-5">
        <div className="table-responsive">
          <table className="table table-hover align-middle bg-white shadow-sm rounded">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Icon</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 && (
                <tr><td colSpan="6" className="text-center text-muted py-4">No categories found. Try re-logging in or check network.</td></tr>
              )}
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td className="fs-4">{cat.icon}</td>
                  <td className="fw-semibold">{cat.categoryName}</td>
                  <td className="text-muted small" style={{maxWidth: '300px'}}>{cat.description}</td>
                  <td>
                    <span className={`badge bg-${cat.active ? 'success' : 'danger'}`}>
                      {cat.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(cat)}><FaEdit /></button>
                      <button className="btn btn-sm btn-outline-warning" onClick={() => handleToggle(cat.id)}>
                        {cat.active ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(cat.id)}><FaTrash /></button>
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
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">{editing ? 'Edit Category' : 'Add Category'}</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Category Name</label>
                      <input type="text" className="form-control" value={form.categoryName}
                        onChange={(e) => setForm({...form, categoryName: e.target.value})} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Description</label>
                      <textarea className="form-control" rows="3" value={form.description}
                        onChange={(e) => setForm({...form, description: e.target.value})} />
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Icon (Emoji)</label>
                        <input type="text" className="form-control" value={form.icon}
                          onChange={(e) => setForm({...form, icon: e.target.value})} placeholder="🧹" />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Image URL</label>
                        <input type="text" className="form-control" value={form.imageUrl}
                          onChange={(e) => setForm({...form, imageUrl: e.target.value})} />
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

export default ManageCategories;

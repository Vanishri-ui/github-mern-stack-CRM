import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';
import DepartmentDocuments from '../components/DepartmentDocuments';

const BillingModule = () => {
    const { user } = useContext(AuthContext);
    const { searchQuery } = useContext(SearchContext);
    const [sales, setSales] = useState([]);
    const [activeTab, setActiveTab] = useState('list'); // list, docs
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        customerName: '',
        productName: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Billed'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/sales');
            setSales(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/sales', formData);
            setShowModal(false);
            setFormData({ customerName: '', productName: '', amount: '', date: new Date().toISOString().split('T')[0], status: 'Billed' });
            fetchData();
        } catch (e) {
            alert('Failed to create invoice');
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`/api/sales/${id}`, { status });
            fetchData();
        } catch (e) { alert('Failed to update status'); }
    };

    const deleteRecord = async (id) => {
        if (window.confirm('Are you sure you want to PERMANENTLY delete this record?')) {
            try {
                await axios.delete(`/api/sales/${id}`);
                fetchData();
            } catch (e) { alert('Failed to delete'); }
        }
    };

    // Filter: Show everything that is past technical execution (Executed, Billed, Paid)
    const billingItems = sales.filter(s =>
        (s.status === 'Executed' || s.status === 'Billed' || s.status === 'Paid') &&
        (!searchQuery || s.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const hasPermission = (perm) => user.role === 'admin' || user.permissions?.includes(perm);

    return (
        <section className="content-header">
            <div className="container-fluid">
                <div className="row mb-3 align-items-center">
                    <div className="col-md-6">
                        <h1 className="mb-0">Billing & Collection</h1>
                        <p className="text-muted small">
                            User: <span className="fw-bold">{user.name}</span> | Title: <span className="badge bg-dark">{user.title || 'Staff'}</span>
                            <span className="ms-2 text-primary">{user.permissions?.join(', ')}</span>
                        </p>
                    </div>
                    <div className="col-md-6 text-end">
                        {hasPermission('CREATE') && (
                            <button className="btn btn-primary shadow-sm" onClick={() => setShowModal(true)}>
                                <i className="bi bi-receipt me-1"></i> Create Invoice
                            </button>
                        )}
                    </div>
                </div>

                <div className="card card-primary card-outline card-outline-tabs shadow-sm">
                    <div className="card-header p-0 border-bottom-0">
                        <ul className="nav nav-tabs" role="tablist">
                            <li className="nav-item">
                                <span className={`nav-link ${activeTab === 'list' ? 'active' : ''}`} role="button" onClick={() => setActiveTab('list')}>
                                    <i className="bi bi-list-columns-reverse me-2"></i>Invoice Management
                                </span>
                            </li>
                            <li className="nav-item">
                                <span className={`nav-link ${activeTab === 'docs' ? 'active' : ''}`} role="button" onClick={() => setActiveTab('docs')}>
                                    <i className="bi bi-file-earmark-text me-2"></i>Documents
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="card-body p-0">
                        {activeTab === 'list' && (
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped table-hover table-sm text-nowrap align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                                    <thead className="table-light text-center">
                                        <tr>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Customer Name</th>
                                            <th>Product</th>
                                            <th>Amount</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {billingItems.length === 0 ? (
                                            <tr><td colSpan="6" className="text-center py-4 text-muted">No records found.</td></tr>
                                        ) : (
                                            billingItems.map(s => (
                                                <tr key={s._id}>
                                                    <td className="text-center">
                                                        <span className={`badge ${s.status === 'Paid' ? 'bg-success' : s.status === 'Billed' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                                            {s.status === 'Paid' ? 'PAID' : s.status === 'Billed' ? 'INVOICE SENT' : 'NOT SENT'}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">{new Date(s.date).toLocaleDateString()}</td>
                                                    <td className="fw-bold">{s.customerName}</td>
                                                    <td>{s.productName}</td>
                                                    <td className="text-end fw-bold text-success">${s.amount.toLocaleString()}</td>
                                                    <td className="text-center">
                                                        <div className="btn-group">
                                                            {s.status === 'Executed' && hasPermission('UPDATE') && (
                                                                <button className="btn btn-xs btn-dark" onClick={() => updateStatus(s._id, 'Billed')}>
                                                                    <i className="bi bi-send-fill me-1"></i> Send Invoice
                                                                </button>
                                                            )}
                                                            {s.status === 'Billed' && hasPermission('UPDATE') && (
                                                                <button className="btn btn-xs btn-success" onClick={() => updateStatus(s._id, 'Paid')}>
                                                                    <i className="bi bi-check-circle-fill me-1"></i> Confirm Payment
                                                                </button>
                                                            )}
                                                            {hasPermission('DELETE') && (
                                                                <button className="btn btn-xs btn-outline-danger ms-1" onClick={() => deleteRecord(s._id)}>
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            )}
                                                        </div>
                                                        {s.status === 'Paid' && <span className="text-success small ms-2"><i className="bi bi-patch-check-fill me-1"></i>Settled</span>}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'docs' && (
                            <div className="p-3">
                                <DepartmentDocuments department="finance" />
                            </div>
                        )}
                    </div>
                </div>
                {/* CREATE MODAL */}
                {showModal && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title">New Invoice Entry</h5>
                                    <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                                </div>
                                <form onSubmit={handleCreate}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Customer Name</label>
                                            <input type="text" className="form-control" name="customerName" value={formData.customerName} onChange={handleInputChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Product</label>
                                            <input type="text" className="form-control" name="productName" value={formData.productName} onChange={handleInputChange} required />
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label small fw-bold">Amount ($)</label>
                                                <input type="number" className="form-control" name="amount" value={formData.amount} onChange={handleInputChange} required />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label small fw-bold">Date</label>
                                                <input type="date" className="form-control" name="date" value={formData.date} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                                        <button type="submit" className="btn btn-primary">Create Invoice</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default BillingModule;

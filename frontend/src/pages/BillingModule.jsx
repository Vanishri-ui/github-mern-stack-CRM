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

    // Create Function Removed
    // Input Change Removed

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
                        {/* "Create Invoice" removed as per feedback. Billing should track existing sales. */}
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
                                            <th>Monthly Invoice</th>
                                            <th>Payment Status</th>
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
                                                            {s.status === 'Paid' ? 'PAID' : s.status === 'Billed' ? 'INVOICED' : s.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">{new Date(s.date).toLocaleDateString()}</td>
                                                    <td className="fw-bold">{s.customerName}</td>
                                                    <td>{s.productName}</td>
                                                    <td className="text-end fw-bold text-success">${s.amount.toLocaleString()}</td>

                                                    {/* Monthly Invoice Check */}
                                                    <td className="text-center">
                                                        {s.status === 'Executed' ? (
                                                            <button className="btn btn-sm btn-outline-warning" onClick={() => updateStatus(s._id, 'Billed')} title="Mark Invoice Sent">
                                                                <i className="bi bi-envelope"></i> Send Invoice
                                                            </button>
                                                        ) : (['Billed', 'Paid'].includes(s.status)) ? (
                                                            <span className="text-success fw-bold"><i className="bi bi-check-circle-fill"></i> Sent</span>
                                                        ) : (
                                                            <span className="text-muted small">-</span>
                                                        )}
                                                    </td>

                                                    {/* Payment Received Check */}
                                                    <td className="text-center">
                                                        {s.status === 'Billed' ? (
                                                            <button className="btn btn-sm btn-outline-success" onClick={() => updateStatus(s._id, 'Paid')} title="Mark Payment Received">
                                                                <i className="bi bi-currency-dollar"></i> Confirm Pay
                                                            </button>
                                                        ) : (s.status === 'Paid') ? (
                                                            <span className="text-success fw-bold"><i className="bi bi-check-double"></i> Received</span>
                                                        ) : (
                                                            <span className="text-muted small">Pending Invoice</span>
                                                        )}
                                                    </td>

                                                    <td className="text-center">
                                                        <div className="btn-group">
                                                            {hasPermission('DELETE') && (
                                                                <button className="btn btn-xs btn-outline-danger ms-1" onClick={() => deleteRecord(s._id)}>
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            )}
                                                        </div>
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
                {/* CREATE MODAL REMOVED */}
            </div>
        </section>
    );
};

export default BillingModule;

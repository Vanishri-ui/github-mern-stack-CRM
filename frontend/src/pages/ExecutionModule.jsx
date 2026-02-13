import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';
import DepartmentDocuments from '../components/DepartmentDocuments';

const ExecutionModule = () => {
    const { user } = useContext(AuthContext);
    const { searchQuery } = useContext(SearchContext);
    const [orders, setOrders] = useState([]);

    const hasPermission = (perm) => user.role === 'admin' || user.permissions?.includes(perm);

    // Manual Work Order State
    const [showWOModal, setShowWOModal] = useState(false);
    const [woData, setWoData] = useState({
        customerName: '',
        productName: '',
        amount: '',
        serviceLines: '',
        orderType: 'New Sale',
        accountType: '',
        accountName: '',
        placeMailId: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/sales');
            setOrders(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const updateStatus = async (id, newStatus) => {
        if (window.confirm(`Mark order as ${newStatus}?`)) {
            try {
                await axios.put(`/api/sales/${id}`, { status: newStatus });
                fetchOrders();
            } catch (e) { alert('Failed to update status'); }
        }
    };

    const handleCreateWO = async (e) => {
        e.preventDefault();
        try {
            const dateStr = woData.date.replace(/-/g, '');
            const random = Math.floor(1000 + Math.random() * 9000);
            const woNum = `WO-${dateStr}-${random}`;

            await axios.post('/api/sales', {
                ...woData,
                workOrderNumber: woNum,
                status: 'Pending Execution',
                agentName: 'Execution Team Manual Entry',
                salesPerson: user.id
            });
            setShowWOModal(false);
            setWoData({ customerName: '', productName: '', amount: '', serviceLines: '', orderType: 'New Sale', accountType: '', accountName: '', placeMailId: '', date: new Date().toISOString().split('T')[0] });
            fetchOrders();
        } catch (e) { alert('Failed to create Work Order'); }
    };

    // Helper to format WO number if not present in DB
    const getWONumber = (order) => {
        if (order.workOrderNumber) return order.workOrderNumber;
        const d = new Date(order.date);
        const dateStr = d.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
        const suffix = order._id.slice(-4).toUpperCase();
        return `WO-${dateStr}-${suffix}`;
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to PERMANENTLY delete this record?')) {
            try {
                await axios.delete(`/api/sales/${id}`);
                fetchOrders();
            } catch (e) { alert('Failed to delete'); }
        }
    };

    const pendingOrders = orders.filter(o => o.status === 'Pending Execution' || !o.status);
    const executedOrders = orders.filter(o => o.status === 'Executed' || o.status === 'Billed');

    return (
        <section className="content-header">
            <div className="container-fluid">
                <div className="row mb-2">
                    <div className="col-sm-6"><h1>Order Execution</h1></div>
                    <div className="col-sm-6 text-end">
                        {hasPermission('CREATE') && (
                            <button className="btn btn-primary shadow-sm" onClick={() => setShowWOModal(true)}>
                                <i className="bi bi-plus-lg"></i> Manual Work Order
                            </button>
                        )}
                    </div>
                </div>

                {/* KPI CARDS */}
                <div className="row mb-3">
                    <div className="col-md-6">
                        <div className="info-box shadow-sm mb-3">
                            <span className="info-box-icon bg-warning elevation-1"><i className="bi bi-hourglass-split"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Pending Execution</span>
                                <span className="info-box-number">{pendingOrders.length}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="info-box shadow-sm mb-3">
                            <span className="info-box-icon bg-success elevation-1"><i className="bi bi-check2-all"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Completed Orders</span>
                                <span className="info-box-number">{executedOrders.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABS */}
                <div className="card card-primary card-outline card-outline-tabs shadow-sm mt-3">
                    <div className="card-header p-0 border-bottom-0">
                        <ul className="nav nav-tabs" id="execution-tabs" role="tablist">
                            <li className="nav-item">
                                <span className="nav-link active" id="pending-tab" data-bs-toggle="pill" role="button" href="#pending">
                                    <i className="bi bi-hourglass-split me-2"></i>Pending Orders <span className="badge bg-warning ms-1 text-dark">{pendingOrders.length}</span>
                                </span>
                            </li>
                            <li className="nav-item">
                                <span className="nav-link" id="history-tab" data-bs-toggle="pill" role="button" href="#history">
                                    <i className="bi bi-clock-history me-2"></i>Execution History
                                </span>
                            </li>
                            <li className="nav-item">
                                <span className="nav-link" id="docs-tab" data-bs-toggle="pill" role="button" href="#docs">
                                    <i className="bi bi-file-earmark-text me-2"></i>Documents
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div className="card-body p-0">
                        <div className="tab-content">
                            {/* PENDING TAB */}
                            <div className="tab-pane fade show active" id="pending" role="tabpanel">
                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover table-sm text-nowrap align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                        <thead className="table-light text-center">
                                            <tr>
                                                <th>WO Number</th>
                                                <th>Date</th>
                                                <th>Type</th>
                                                <th>Customer</th>
                                                <th>Product</th>
                                                <th>Lines</th>
                                                <th>Account Details</th>
                                                <th>Account Manager</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingOrders.length === 0 ? (
                                                <tr><td colSpan="7" className="text-center py-4 text-muted">No pending orders.</td></tr>
                                            ) : (
                                                pendingOrders.filter(o => {
                                                    if (!searchQuery) return true;
                                                    const lower = searchQuery.toLowerCase();
                                                    return (o.customerName?.toLowerCase().includes(lower) || getWONumber(o).toLowerCase().includes(lower));
                                                }).map((o) => (
                                                    <tr key={o._id}>
                                                        <td className="fw-bold text-primary">{getWONumber(o)}</td>
                                                        <td className="text-center">{new Date(o.date).toLocaleDateString()}</td>
                                                        <td className="text-center"><span className="badge bg-secondary">{o.orderType || 'New Sale'}</span></td>
                                                        <td className="fw-bold">{o.customerName}</td>
                                                        <td>{o.productName}</td>
                                                        <td className="text-center">{o.serviceLines || (o.numberOfLines || 1) + ' Lines'}</td>
                                                        <td>
                                                            <div className="fw-bold">{o.accountName || '-'}</div>
                                                            <div className="text-muted small">{o.accountType || '-'} | {o.placeMailId || '-'}</div>
                                                        </td>
                                                        <td>
                                                            <span className="fw-bold">{o.agentName || (o.salesPerson && o.salesPerson.name) || 'Unassigned'}</span>
                                                            {o.salesPerson?.title && (
                                                                <div className="text-muted small" style={{ fontSize: '0.7rem' }}>{o.salesPerson.title}</div>
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            {hasPermission('UPDATE') && (
                                                                <button className="btn btn-sm btn-success shadow-none me-1" onClick={() => updateStatus(o._id, 'Executed')}>
                                                                    <i className="bi bi-play-fill"></i> Execute
                                                                </button>
                                                            )}
                                                            {hasPermission('DELETE') && (
                                                                <button className="btn btn-sm btn-outline-danger shadow-none" onClick={() => handleDelete(o._id)}>
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* HISTORY TAB */}
                            <div className="tab-pane fade" id="history" role="tabpanel">
                                <div className="table-responsive">
                                    <table className="table table-bordered table-striped table-hover table-sm text-nowrap align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                        <thead className="table-light text-center">
                                            <tr>
                                                <th>WO Number</th>
                                                <th>Date</th>
                                                <th>Customer</th>
                                                <th>Product</th>
                                                <th>Account Manager</th>
                                                <th>Status</th>
                                                {hasPermission('DELETE') && <th>Action</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {executedOrders.length === 0 ? (
                                                <tr><td colSpan="6" className="text-center py-4 text-muted">No history found.</td></tr>
                                            ) : (
                                                executedOrders.map(o => (
                                                    <tr key={o._id}>
                                                        <td className="fw-bold">{getWONumber(o)}</td>
                                                        <td className="text-center">{new Date(o.date).toLocaleDateString()}</td>
                                                        <td>{o.customerName}</td>
                                                        <td>{o.productName}</td>
                                                        <td>
                                                            <span className="fw-bold">{o.agentName || (o.salesPerson && o.salesPerson.name) || 'Unassigned'}</span>
                                                            {o.salesPerson?.title && (
                                                                <div className="text-muted small" style={{ fontSize: '0.7rem' }}>{o.salesPerson.title}</div>
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            <span className={`badge ${o.status === 'Billed' ? 'bg-success' : 'bg-primary'}`}>
                                                                {o.status}
                                                            </span>
                                                        </td>
                                                        {hasPermission('DELETE') && (
                                                            <td className="text-center">
                                                                <button className="btn btn-xs btn-outline-danger" onClick={() => handleDelete(o._id)}>
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* DOCUMENTS TAB */}
                            <div className="tab-pane fade" id="docs" role="tabpanel">
                                <div className="p-3">
                                    <DepartmentDocuments department="execution" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL */}
                {showWOModal && (
                    <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title">Create Manual Work Order</h5>
                                    <button className="btn-close btn-close-white" onClick={() => setShowWOModal(false)}></button>
                                </div>
                                <form onSubmit={handleCreateWO}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Order Type</label>
                                            <select className="form-select" value={woData.orderType} onChange={e => setWoData({ ...woData, orderType: e.target.value })}>
                                                <option>New Sale</option>
                                                <option>Upgrade</option>
                                                <option>Downgrade</option>
                                                <option>Maintenance</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Customer Name</label>
                                            <input type="text" className="form-control" value={woData.customerName} onChange={e => setWoData({ ...woData, customerName: e.target.value })} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Product / Service</label>
                                            <input type="text" className="form-control" value={woData.productName} onChange={e => setWoData({ ...woData, productName: e.target.value })} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Amount</label>
                                            <input type="number" className="form-control" value={woData.amount} onChange={e => setWoData({ ...woData, amount: e.target.value })} required />
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-2">
                                                <label className="form-label small fw-bold">Account Name</label>
                                                <input type="text" className="form-control form-control-sm" value={woData.accountName} onChange={e => setWoData({ ...woData, accountName: e.target.value })} />
                                            </div>
                                            <div className="col-md-6 mb-2">
                                                <label className="form-label small fw-bold">Account Type</label>
                                                <input type="text" className="form-control form-control-sm" value={woData.accountType} onChange={e => setWoData({ ...woData, accountType: e.target.value })} placeholder="e.g., SIP, Hosted" />
                                            </div>
                                            <div className="col-12 mb-2">
                                                <label className="form-label small fw-bold">Place Mail ID</label>
                                                <input type="email" className="form-control form-control-sm" value={woData.placeMailId} onChange={e => setWoData({ ...woData, placeMailId: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Details / Lines</label>
                                            <textarea className="form-control" rows="2" value={woData.serviceLines} onChange={e => setWoData({ ...woData, serviceLines: e.target.value })}></textarea>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowWOModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary">Create Order</button>
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

export default ExecutionModule;

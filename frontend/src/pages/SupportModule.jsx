import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';
import DepartmentDocuments from '../components/DepartmentDocuments';

const SupportModule = () => {
    const { user } = useContext(AuthContext);
    const { searchQuery } = useContext(SearchContext);
    const [tickets, setTickets] = useState([]);
    const [sales, setSales] = useState([]);
    const [activeTab, setActiveTab] = useState('tickets'); // tickets, customers, docs

    const hasPermission = (perm) => user.role === 'admin' || user.permissions?.includes(perm);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [linkedSale, setLinkedSale] = useState('');
    const [productName, setProductName] = useState('');
    const [serviceLines, setServiceLines] = useState('');

    // Add Data (Sale) State
    const [showSaleModal, setShowSaleModal] = useState(false);
    const [saleData, setSaleData] = useState({
        customerName: '',
        productName: '',
        amount: '',
        agentName: '',
        date: new Date().toISOString().split('T')[0],
        mrc: '',
        initialRecharge: '',
        virtualNumber: '',
        workOrderNumber: '',
        numberOfLines: 1,
        remarks: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ticketRes, saleRes] = await Promise.all([
                axios.get('/api/tickets'),
                axios.get('/api/sales')
            ]);
            setTickets(ticketRes.data);
            setSales(saleRes.data);
            setLoading(false);
        } catch (e) { console.error(e); setLoading(false); }
    };

    const fetchTickets = async () => {
        try { const res = await axios.get('/api/tickets'); setTickets(res.data); } catch (e) { }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/tickets', {
                title, description, priority,
                linkedSale, productName, serviceLines
            });
            setShowModal(false);
            setTitle(''); setDescription('');
            setLinkedSale(''); setProductName(''); setServiceLines('');
            fetchTickets();
        } catch (e) { alert('Failed to create ticket'); }
    };

    const handleResolve = async (id) => {
        if (window.confirm('Mark this ticket as resolved?')) {
            try {
                await axios.put(`/api/tickets/${id}`);
                fetchTickets();
            } catch (e) { alert('Failed'); }
        }
    };

    const handleAddSale = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/sales', {
                ...saleData,
                status: 'Executed', // Auto-set to executed if support adds it retrospectively? 
                // Or 'Pending Execution'. Let's use 'Executed' for database entry.
                salesPerson: user.id
            });
            setShowSaleModal(false);
            setSaleData({ customerName: '', productName: '', amount: '', agentName: '', date: new Date().toISOString().split('T')[0], mrc: '', initialRecharge: '', virtualNumber: '', workOrderNumber: '', numberOfLines: 1, remarks: '' });
            fetchData();
            alert('Customer data added successfully');
        } catch (e) { alert('Failed to add data'); }
    };

    const handleDeleteSale = async (id) => {
        if (window.confirm('Are you sure you want to PERMANENTLY delete this customer record?')) {
            try {
                await axios.delete(`/api/sales/${id}`);
                fetchData();
            } catch (e) { alert('Failed to delete'); }
        }
    };

    // --- UI HELPERS ---

    return (
        <section className="content-header">
            <div className="container-fluid">
                <div className="row mb-3">
                    <div className="col-md-6"><h1>Support & Customers</h1></div>
                    <div className="col-md-6 text-end">
                        {activeTab === 'tickets' ? (
                            <button className="btn btn-primary shadow-sm" onClick={() => setShowModal(true)}>
                                <i className="bi bi-plus-lg me-1"></i> New Ticket
                            </button>
                        ) : activeTab === 'customers' ? (
                            hasPermission('CREATE') && (
                                <button className="btn btn-success shadow-sm" onClick={() => setShowSaleModal(true)}>
                                    <i className="bi bi-person-plus-fill me-1"></i> Add Data
                                </button>
                            )
                        ) : null}
                    </div>
                </div>

                {/* TABS */}
                <div className="card card-primary card-outline card-outline-tabs shadow-sm">
                    <div className="card-header p-0 border-bottom-0">
                        <ul className="nav nav-tabs" id="custom-tabs-four-tab" role="tablist">
                            <li className="nav-item">
                                <span className={`nav-link ${activeTab === 'tickets' ? 'active' : ''}`} role="button" onClick={() => setActiveTab('tickets')}>
                                    <i className="bi bi-ticket-detailed me-2"></i>Tickets <span className="badge bg-danger ms-1">{tickets.filter(t => t.status !== 'Resolved').length}</span>
                                </span>
                            </li>
                            <li className="nav-item">
                                <span className={`nav-link ${activeTab === 'customers' ? 'active' : ''}`} role="button" onClick={() => setActiveTab('customers')}>
                                    <i className="bi bi-people me-2"></i>Customer Database
                                </span>
                            </li>
                            <li className="nav-item">
                                <span className={`nav-link ${activeTab === 'docs' ? 'active' : ''}`} role="button" onClick={() => setActiveTab('docs')}>
                                    <i className="bi bi-folder2-open me-2"></i>Documents
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="card-body p-0">

                        {/* TICKETS TAB */}
                        {activeTab === 'tickets' && (
                            <>
                                <div className="table-responsive">
                                    <table className="table table-bordered table-striped table-hover table-sm text-nowrap align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                                        <thead className="table-light text-center">
                                            <tr>
                                                <th>Status</th>
                                                <th>Subject</th>
                                                <th>Product Ref</th>
                                                <th>Priority</th>
                                                <th>Raised By</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tickets.length === 0 ? <tr><td colSpan="6" className="text-center py-4">No tickets found.</td></tr> :
                                                tickets.filter(t => !searchQuery
                                                    || t.title?.toLowerCase().includes(searchQuery.toLowerCase())
                                                    || t.description?.toLowerCase().includes(searchQuery.toLowerCase())
                                                ).map(t => (
                                                    <tr key={t._id}>
                                                        <td className="text-center">
                                                            <span className={`badge ${t.status === 'Resolved' ? 'bg-success' : 'bg-warning'}`}>
                                                                {t.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="fw-bold d-block">{t.title}</span>
                                                            <small className="text-muted text-wrap" style={{ maxWidth: '300px', display: 'block' }}>{t.description}</small>
                                                        </td>
                                                        <td>
                                                            {t.productName ? (
                                                                <div><span className="fw-bold">{t.productName}</span> <span className="text-muted small">({t.serviceLines} Lines)</span></div>
                                                            ) : <span className="text-muted">-</span>}
                                                        </td>
                                                        <td className="text-center">
                                                            <span className={`badge ${t.priority === 'High' ? 'bg-danger' : t.priority === 'Medium' ? 'bg-info' : 'bg-secondary'}`}>
                                                                {t.priority}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">{t.user ? t.user.name : 'Unknown'}</td>
                                                        <td className="text-center">
                                                            {(user.role === 'admin' || user.department === 'tech') && t.status !== 'Resolved' && hasPermission('UPDATE') && (
                                                                <button className="btn btn-sm btn-success shadow-sm" onClick={() => handleResolve(t._id)}>
                                                                    <i className="bi bi-check-lg"></i> Solve
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* CUSTOMERS TAB */}
                        {activeTab === 'customers' && (
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped table-hover table-sm text-nowrap align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                    <thead className="table-dark text-center">
                                        <tr>
                                            <th>Account Manager</th>
                                            <th>Company Name</th>
                                            <th>Lines</th>
                                            <th>Product</th>
                                            <th>Virtual Number</th>
                                            <th>WO Number</th>
                                            <th>MRC</th>
                                            <th>Initial Recharge</th>
                                            <th>Description/Notes</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sales.length === 0 ? (
                                            <tr><td colSpan="9" className="text-center py-4 text-muted">No records found.</td></tr>
                                        ) : (
                                            sales.filter(s => {
                                                if (!searchQuery) return true;
                                                const lower = searchQuery.toLowerCase();
                                                return (
                                                    s.customerName?.toLowerCase().includes(lower) ||
                                                    s.productName?.toLowerCase().includes(lower) ||
                                                    s.virtualNumber?.toLowerCase().includes(lower) ||
                                                    s.workOrderNumber?.toLowerCase().includes(lower)
                                                );
                                            }).map((s, idx) => (
                                                <tr key={idx}>
                                                    <td>
                                                        <span className="fw-bold">{s.agentName || s.salesPerson?.name || '-'}</span>
                                                        {s.salesPerson?.title && (
                                                            <div className="text-muted small" style={{ fontSize: '0.7rem' }}>{s.salesPerson.title}</div>
                                                        )}
                                                    </td>
                                                    <td className="fw-bold">{s.customerName}</td>
                                                    <td className="text-center">{s.numberOfLines || 1}</td>
                                                    <td>{s.productName}</td>
                                                    <td className="text-primary fw-bold text-center">{s.virtualNumber || '-'}</td>
                                                    <td className="text-center"><small>{s.workOrderNumber || '-'}</small></td>
                                                    <td className="text-end fw-bold text-success">${(s.mrc || 0).toLocaleString()}</td>
                                                    <td className="text-end fw-bold">${(s.initialRecharge || 0).toLocaleString()}</td>
                                                    <td className="text-wrap" style={{ minWidth: '200px' }}>{s.remarks || s.serviceLines || '-'}</td>
                                                    <td className="text-center">
                                                        {hasPermission('DELETE') && (
                                                            <button className="btn btn-xs btn-outline-danger" onClick={() => handleDeleteSale(s._id)}>
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
                        )}

                        {/* DOCUMENTS TAB */}
                        {activeTab === 'docs' && (
                            <div className="p-3">
                                <DepartmentDocuments department="tech" />
                            </div>
                        )}

                    </div>
                </div>

                {/* MODAL */}
                {showModal && (
                    <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header bg-warning">
                                    <h5 className="modal-title">New Support Ticket</h5>
                                    <button className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Customer (Product Ref)</label>
                                            <select className="form-select" onChange={e => {
                                                const saleId = e.target.value;
                                                const sale = sales.find(s => s._id === saleId);
                                                if (sale) {
                                                    setLinkedSale(saleId);
                                                    setProductName(sale.productName);
                                                    setServiceLines(sale.serviceLines || 'N/A');
                                                    setTitle(`Issue with ${sale.productName}`);
                                                } else {
                                                    setLinkedSale(''); setProductName(''); setServiceLines('');
                                                }
                                            }}>
                                                <option value="">-- Select Customer --</option>
                                                {sales.map(s => (
                                                    <option key={s._id} value={s._id}>
                                                        {s.customerName} - {s.productName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label small fw-bold">Product</label>
                                                <input className="form-control" value={productName} readOnly disabled />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label small fw-bold">Lines</label>
                                                <input className="form-control" value={serviceLines} readOnly disabled />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Subject</label>
                                            <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Priority</label>
                                            <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
                                                <option>Low</option>
                                                <option>Medium</option>
                                                <option>High</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Description</label>
                                            <textarea className="form-control" rows="3" value={description} onChange={e => setDescription(e.target.value)}></textarea>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-warning">Create Ticket</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* ADD DATA MODAL */}
                {showSaleModal && (
                    <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content text-dark shadow-lg border-0">
                                <div className="modal-header bg-success text-white">
                                    <h5 className="modal-title"><i className="bi bi-person-plus-fill me-2"></i>New Customer Entry</h5>
                                    <button className="btn-close btn-close-white" onClick={() => setShowSaleModal(false)}></button>
                                </div>
                                <form onSubmit={handleAddSale}>
                                    <div className="modal-body p-4">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">Customer Name</label>
                                                <input className="form-control form-control-sm" value={saleData.customerName} onChange={e => setSaleData({ ...saleData, customerName: e.target.value })} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">Product Name</label>
                                                <input className="form-control form-control-sm" value={saleData.productName} onChange={e => setSaleData({ ...saleData, productName: e.target.value })} required />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold">Amount</label>
                                                <input type="number" className="form-control form-control-sm" value={saleData.amount} onChange={e => setSaleData({ ...saleData, amount: e.target.value })} required />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold">Account Manager</label>
                                                <input className="form-control form-control-sm" value={saleData.agentName} onChange={e => setSaleData({ ...saleData, agentName: e.target.value })} />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold">MRC</label>
                                                <input type="number" className="form-control form-control-sm" value={saleData.mrc} onChange={e => setSaleData({ ...saleData, mrc: e.target.value })} />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold">Initial Recharge</label>
                                                <input type="number" className="form-control form-control-sm" value={saleData.initialRecharge} onChange={e => setSaleData({ ...saleData, initialRecharge: e.target.value })} />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold">Virtual Number</label>
                                                <input className="form-control form-control-sm" value={saleData.virtualNumber} onChange={e => setSaleData({ ...saleData, virtualNumber: e.target.value })} />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold">Date</label>
                                                <input type="date" className="form-control form-control-sm" value={saleData.date} onChange={e => setSaleData({ ...saleData, date: e.target.value })} />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold">Work Order #</label>
                                                <input className="form-control form-control-sm" value={saleData.workOrderNumber} onChange={e => setSaleData({ ...saleData, workOrderNumber: e.target.value })} />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold">Number of Lines</label>
                                                <input type="number" className="form-control form-control-sm" value={saleData.numberOfLines} onChange={e => setSaleData({ ...saleData, numberOfLines: e.target.value })} />
                                            </div>
                                            <div className="col-md-12">
                                                <label className="form-label small fw-bold">Description/Notes</label>
                                                <textarea className="form-control form-control-sm" rows="2" value={saleData.remarks} onChange={e => setSaleData({ ...saleData, remarks: e.target.value })}></textarea>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer bg-light">
                                        <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowSaleModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-sm btn-success px-4">Save Customer</button>
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

export default SupportModule;

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';
import DepartmentDocuments from '../components/DepartmentDocuments';

const SalesModule = () => {
    const { user } = useContext(AuthContext);
    const { searchQuery } = useContext(SearchContext);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        customerName: '',
        productName: '',
        amount: '',
        agentName: '',
        date: new Date().toISOString().split('T')[0], // Default today
        followUpDate: '',
        followUpNotes: ''
    });

    const [reminders, setReminders] = useState([]);

    // Analytics State
    const [stats, setStats] = useState({
        mrc: 0,
        mySalesTotal: 0,
        teamSalesTotal: 0,
        pipeline: { pending: 0, executed: 0, billed: 0 },
        myTarget: 25000,
        teamTarget: 100000
    });

    useEffect(() => {
        if (sales.length > 0) {
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            const todayStr = today.toISOString().split('T')[0];

            // 1. Reminders
            const due = sales.filter(s => s.followUpDate && s.followUpDate.split('T')[0] === todayStr);
            setReminders(due);

            // 2. Analytics
            let mrc = 0;
            let myTotal = 0;
            let teamTotal = 0;
            let pending = 0;
            let executed = 0;
            let billed = 0;

            sales.forEach(s => {
                const sDate = new Date(s.date);
                const amount = Number(s.amount) || 0;

                // Team Total
                teamTotal += amount;

                // MRC (This Month)
                if (sDate.getMonth() === currentMonth && sDate.getFullYear() === currentYear) {
                    mrc += amount;
                }

                // My Sales (Match by Name)
                if (user && s.agentName === user.name) {
                    myTotal += amount;
                }

                // Pipeline
                if (s.status === 'Pending Execution') pending++;
                else if (s.status === 'Executed') executed++;
                else if (s.status === 'Billed') billed++;
            });

            setStats(prev => ({
                ...prev,
                mrc,
                mySalesTotal: myTotal,
                teamSalesTotal: teamTotal,
                pipeline: { pending, executed, billed }
            }));
        }
    }, [sales, user]);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const res = await axios.get('/api/sales');
            setSales(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({
            customerName: '',
            productName: '',
            amount: '',
            agentName: user ? user.name : '', // Default to current user
            date: new Date().toISOString().split('T')[0],
            followUpDate: '',
            followUpNotes: ''
        });
        setIsEditing(false);
        setCurrentId(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (sale) => {
        setFormData({
            customerName: sale.customerName || '',
            productName: sale.productName || '',
            amount: sale.amount || '',
            agentName: sale.agentName || (sale.salesPerson && sale.salesPerson.name) || '',
            date: sale.date ? sale.date.split('T')[0] : '',
            status: sale.status || 'Pending Execution',
            followUpDate: sale.followUpDate ? sale.followUpDate.split('T')[0] : '',
            followUpNotes: sale.followUpNotes || ''
        });
        setIsEditing(true);
        setCurrentId(sale._id);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`/api/sales/${currentId}`, formData);
            } else {
                await axios.post('/api/sales', formData);
            }
            setShowModal(false);
            fetchSales();
        } catch (err) {
            console.error(err);
            alert(`Error saving sale: ${err.response?.data?.msg || err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this sale?')) {
            try {
                await axios.delete(`/api/sales/${id}`);
                fetchSales();
            } catch (err) {
                alert('Error deleting');
            }
        }
    };

    return (
        <section className="content-header">
            <div className="container-fluid">

                {/* PAGE HEADER */}
                <div className="row mb-2">
                    <div className="col-sm-6">
                        <h1 className="fw-light text-dark">Sales Orders</h1>
                    </div>
                    <div className="col-sm-6">
                        <button className="btn btn-primary btn-sm float-sm-end shadow-sm" onClick={openCreateModal}>
                            <i className="bi bi-plus-lg me-1"></i> Create Sale
                        </button>
                    </div>
                </div>


                {/* ANALYTICS DASHBOARD */}
                <div className="row mb-3">
                    {/* 1. MRC */}
                    <div className="col-md-3 col-sm-6 col-12">
                        <div className="info-box shadow-sm">
                            <span className="info-box-icon bg-info"><i className="bi bi-calendar-check"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">MRC (This Month)</span>
                                <span className="info-box-number">${stats.mrc.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. My Performance */}
                    <div className="col-md-3 col-sm-6 col-12">
                        <div className="info-box shadow-sm">
                            <span className="info-box-icon bg-success"><i className="bi bi-person-check"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">My Target ({Math.round((stats.mySalesTotal / stats.myTarget) * 100)}%)</span>
                                <span className="info-box-number">${stats.mySalesTotal.toLocaleString()} <small>/ ${stats.myTarget.toLocaleString()}</small></span>
                                <div className="progress">
                                    <div className="progress-bar bg-success" style={{ width: `${Math.min((stats.mySalesTotal / stats.myTarget) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Team Performance */}
                    <div className="col-md-3 col-sm-6 col-12">
                        <div className="info-box shadow-sm">
                            <span className="info-box-icon bg-warning"><i className="bi bi-people"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Team Target ({Math.round((stats.teamSalesTotal / stats.teamTarget) * 100)}%)</span>
                                <span className="info-box-number">${stats.teamSalesTotal.toLocaleString()} <small>/ ${stats.teamTarget.toLocaleString()}</small></span>
                                <div className="progress">
                                    <div className="progress-bar bg-warning" style={{ width: `${Math.min((stats.teamSalesTotal / stats.teamTarget) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Pipeline Status */}
                    <div className="col-md-3 col-sm-6 col-12">
                        <div className="info-box shadow-sm">
                            <span className="info-box-icon bg-danger"><i className="bi bi-pie-chart"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Pipeline Status</span>
                                <span className="info-box-number" style={{ fontSize: '0.9rem' }}>
                                    Open: {stats.pipeline.pending} | Closed: {stats.pipeline.executed + stats.pipeline.billed}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* REMINDERS WIDGET */}
                {reminders.length > 0 && (
                    <div className="alert alert-warning shadow-sm">
                        <h5><i className="icon bi bi-bell-fill"></i> Today's Follow-ups</h5>
                        <ul className="mb-0">
                            {reminders.map(r => (
                                <li key={r._id}>
                                    <strong>Call {r.customerName}</strong> ({r.productName})
                                    {r.followUpNotes && <span> - Note: {r.followUpNotes}</span>}
                                    <button className="btn btn-xs btn-outline-dark ms-2" onClick={() => openEditModal(r)}>View</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* SALES LIST TABLE */}
                <div className="card card-outline card-primary shadow-sm">
                    <div className="card-header">
                        <h3 className="card-title fw-normal">All Sales</h3>
                        {/* Search input removed, using Global Search in Header */}
                    </div>
                    <div className="card-body table-responsive p-0">
                        <table className="table table-hover table-sm text-nowrap align-middle">
                            <thead className="bg-light">
                                <tr className="text-muted small text-uppercase">
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Product</th>
                                    <th>Amount</th>
                                    <th>Status ({'Pipeline'})</th>
                                    <th>Account Manager</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" className="text-center">Loading...</td></tr>
                                ) : sales.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center">No sales found.</td></tr>
                                ) : sales.filter(item => {
                                    if (!searchQuery) return true;
                                    const lower = searchQuery.toLowerCase();
                                    return (
                                        item.customerName?.toLowerCase().includes(lower) ||
                                        item.productName?.toLowerCase().includes(lower) ||
                                        item.agentName?.toLowerCase().includes(lower) ||
                                        (item.salesPerson?.name?.toLowerCase().includes(lower)) ||
                                        item.amount?.toString().includes(lower) ||
                                        item.status?.toLowerCase().includes(lower)
                                    );
                                }).length === 0 ? (
                                    <tr><td colSpan="7" className="text-center">No matching records found.</td></tr>
                                ) : (
                                    sales.filter(item => {
                                        if (!searchQuery) return true;
                                        const lower = searchQuery.toLowerCase();
                                        return (
                                            item.customerName?.toLowerCase().includes(lower) ||
                                            item.productName?.toLowerCase().includes(lower) ||
                                            item.agentName?.toLowerCase().includes(lower) ||
                                            (item.salesPerson?.name?.toLowerCase().includes(lower)) ||
                                            item.amount?.toString().includes(lower) ||
                                            item.status?.toLowerCase().includes(lower)
                                        );
                                    }).map((sale) => (
                                        <tr key={sale._id}>
                                            <td>{new Date(sale.date).toLocaleDateString()}</td>
                                            <td>{sale.customerName}</td>
                                            <td>{sale.productName}</td>
                                            <td><span className="badge bg-success">${sale.amount ? sale.amount.toLocaleString() : '0'}</span></td>
                                            <td>
                                                <span className={`badge ${sale.status === 'Billed' ? 'bg-success' :
                                                    sale.status === 'Executed' ? 'bg-info' :
                                                        'bg-warning'
                                                    }`}>
                                                    {sale.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="user-block">
                                                    <span className="username" style={{ marginLeft: 0 }}>
                                                        {sale.agentName || (sale.salesPerson && sale.salesPerson.name) || 'Unknown'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                {/* Show buttons if Admin, Sales Manager, or Owner */}
                                                {(user?.role === 'admin' || user?.isSalesManager ||
                                                    (sale.salesPerson && (sale.salesPerson._id === user?.id || sale.salesPerson === user?.id))) && (
                                                        <>
                                                            <button className="btn btn-sm btn-info me-1" onClick={() => openEditModal(sale)}>
                                                                <i className="bi bi-pencil"></i>
                                                            </button>
                                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(sale._id)}>
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </>
                                                    )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL (Bootstrap 5) */}
                {showModal && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{isEditing ? 'Edit Sale' : 'Create New Sale'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Customer Name <span className="text-danger">*</span></label>
                                                <input type="text" className="form-control" name="customerName" value={formData.customerName} onChange={handleInputChange} required />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Product Name <span className="text-danger">*</span></label>
                                                <input type="text" className="form-control" name="productName" value={formData.productName} onChange={handleInputChange} required />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Amount ($) <span className="text-danger">*</span></label>
                                                <input type="number" className="form-control" name="amount" value={formData.amount} onChange={handleInputChange} required />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Date <span className="text-danger">*</span></label>
                                                <input type="date" className="form-control" name="date" value={formData.date} onChange={handleInputChange} required />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Pipeline Status</label>
                                                <select className="form-select" name="status" value={formData.status} onChange={handleInputChange}>
                                                    <option value="Pending Execution">Pending Execution</option>
                                                    <option value="Executed">Executed</option>
                                                    <option value="Billed">Billed</option>
                                                </select>
                                            </div>
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label">Account Manager (Agent Name)</label>
                                                <input type="text" className="form-control" name="agentName" value={formData.agentName} onChange={handleInputChange} placeholder="Enter name if different from logged in user" />
                                            </div>

                                            {/* FOLLOW UP SECTION */}
                                            <div className="col-12"><hr /><h6>Follow Up Reminder</h6></div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Next Follow Up Date</label>
                                                <input type="date" className="form-control" name="followUpDate" value={formData.followUpDate} onChange={handleInputChange} />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Notes / Instructions</label>
                                                <input type="text" className="form-control" name="followUpNotes" value={formData.followUpNotes} onChange={handleInputChange} placeholder="e.g. Call regarding renewal" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary">{isEditing ? 'Update Sale' : 'Save Sale'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div >
                )}

                {/* DOCUMENTS SECTION */}
                <div className="row mt-4">
                    <div className="col-12">
                        <DepartmentDocuments department="sales" />
                    </div>
                </div>

            </div>
        </section>
    );
};

export default SalesModule;

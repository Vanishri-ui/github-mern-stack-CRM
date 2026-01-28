import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';
import DepartmentDocuments from '../components/DepartmentDocuments';

const SalesModule = () => {
    const { user } = useContext(AuthContext);
    const { searchQuery } = useContext(SearchContext);
    const [sales, setSales] = useState([]);

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
        date: new Date().toISOString().split('T')[0],
        // New Fields
        orderType: 'New Sale',
        mrc: '',
        initialRecharge: '',
        numberOfLines: 1,
        remarks: '',

        status: 'Pending Execution',
        followUpDate: '',
        followUpNotes: '',
        virtualNumber: '' // New Field
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

            const due = sales.filter(s => s.followUpDate && s.followUpDate.split('T')[0] === todayStr);
            setReminders(due);

            let mrcTotal = 0;
            let myTotal = 0;
            let teamTotal = 0;
            let pending = 0;
            let executed = 0;
            let billed = 0;

            sales.forEach(s => {
                const sDate = new Date(s.date);
                const amount = Number(s.amount) || 0;
                const mrc = Number(s.mrc) || 0;

                teamTotal += amount;

                if (sDate.getMonth() === currentMonth && sDate.getFullYear() === currentYear) {
                    mrcTotal += mrc;
                }

                if (user && (s.agentName === user.name || s.salesPerson?.name === user.name)) {
                    myTotal += amount;
                }

                if (s.status === 'Pending Execution') pending++;
                else if (s.status === 'Executed') executed++;
                else if (s.status === 'Billed') billed++;
            });

            setStats(prev => ({
                ...prev,
                mrc: mrcTotal,
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

    const hasPermission = (perm) => user.role === 'admin' || user.permissions?.includes(perm);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({
            customerName: '',
            productName: '',
            amount: '',
            agentName: user ? user.name : '',
            date: new Date().toISOString().split('T')[0],
            orderType: 'New Sale',
            mrc: '',
            initialRecharge: '',
            numberOfLines: 1,
            remarks: '',
            status: 'Pending Execution',
            followUpDate: '',
            followUpNotes: '',
            virtualNumber: ''
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
            orderType: sale.orderType || 'New Sale',
            mrc: sale.mrc || '',
            initialRecharge: sale.initialRecharge || '',
            numberOfLines: sale.numberOfLines || 1,
            remarks: sale.remarks || '',
            status: sale.status || 'Pending Execution',
            followUpDate: sale.followUpDate ? sale.followUpDate.split('T')[0] : '',
            followUpNotes: sale.followUpNotes || '',
            virtualNumber: sale.virtualNumber || ''
        });
        setIsEditing(true);
        setCurrentId(sale._id);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let dataToSend = { ...formData };
            const isUpgrade = dataToSend.orderType === 'Upgrade';

            // Logic: if stopped/renewal becomes continuing
            if (dataToSend.orderType === 'Renewal') {
                dataToSend.status = 'Continuing';
            }

            if (isEditing) {
                await axios.put(`/api/sales/${currentId}`, dataToSend);
            } else {
                await axios.post('/api/sales', dataToSend);
            }

            if (isUpgrade) {
                alert(`🚀 UPGRADE ALERT: Customer "${dataToSend.customerName}" has upgraded their lines! All teams have been notified.`);
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
                <div className="row mb-2">
                    <div className="col-sm-6">
                        <h1 className="fw-bold text-dark">Sales Orders</h1>
                    </div>
                    <div className="col-sm-6 text-end">
                        {hasPermission('CREATE') && (
                            <button className="btn btn-primary shadow-sm" onClick={openCreateModal}>
                                <i className="bi bi-plus-lg me-1"></i> New Sale
                            </button>
                        )}
                    </div>
                </div>

                {/* ANALYTICS ROW */}
                <div className="row mb-3">
                    <div className="col-md-3 col-sm-6">
                        <div className="info-box shadow-sm mb-3">
                            <span className="info-box-icon bg-info elevation-1"><i className="bi bi-calendar-check"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">MRC (This Month)</span>
                                <span className="info-box-number">${stats.mrc.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6">
                        <div className="info-box shadow-sm mb-3">
                            <span className="info-box-icon bg-success elevation-1"><i className="bi bi-person-check"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">My Performance</span>
                                <span className="info-box-number">${stats.mySalesTotal.toLocaleString()}</span>
                                <div className="progress">
                                    <div className="progress-bar bg-success" style={{ width: `${Math.min((stats.mySalesTotal / stats.myTarget) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6">
                        <div className="info-box shadow-sm mb-3">
                            <span className="info-box-icon bg-warning elevation-1"><i className="bi bi-people"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Team Performance</span>
                                <span className="info-box-number">${stats.teamSalesTotal.toLocaleString()}</span>
                                <div className="progress">
                                    <div className="progress-bar bg-warning" style={{ width: `${Math.min((stats.teamSalesTotal / stats.teamTarget) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6">
                        <div className="info-box shadow-sm mb-3">
                            <span className="info-box-icon bg-danger elevation-1"><i className="bi bi-pie-chart"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Pipeline</span>
                                <span className="info-box-number">Open: {stats.pipeline.pending}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* REMINDERS */}
                {reminders.length > 0 && (
                    <div className="callout callout-warning shadow-sm">
                        <h5><i className="bi bi-bell-fill text-warning"></i> Follow-ups Needed</h5>
                        <ul className="list-unstyled">
                            {reminders.map(r => (
                                <li key={r._id} className="mb-1">
                                    <span className="fw-bold">{r.customerName}</span> ({r.productName}) - {r.followUpNotes}
                                    <button className="btn btn-link py-0 ms-2 text-primary" onClick={(e) => { e.preventDefault(); openEditModal(r); }}>View</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* TABS */}
                <div className="card card-primary card-outline card-outline-tabs shadow-sm mt-3">
                    <div className="card-header p-0 border-bottom-0">
                        <ul className="nav nav-tabs" id="sales-tabs" role="tablist">
                            <li className="nav-item">
                                <span className="nav-link active" id="sales-data-tab" data-bs-toggle="pill" role="button" href="#sales-data">
                                    <i className="bi bi-table me-2"></i>Sales Data
                                </span>
                            </li>
                            <li className="nav-item">
                                <span className="nav-link" id="sales-docs-tab" data-bs-toggle="pill" role="button" href="#sales-docs">
                                    <i className="bi bi-file-earmark-text me-2"></i>Sales Documents
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div className="card-body p-0">
                        <div className="tab-content">
                            {/* SALES DATA TAB */}
                            <div className="tab-pane fade show active" id="sales-data" role="tabpanel">
                                <div className="table-responsive">
                                    <table className="table table-bordered table-striped table-hover table-sm text-nowrap align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                        <thead className="table-light text-center align-middle">
                                            <tr>
                                                <th>Date</th>
                                                <th>Type</th>
                                                <th>Customer</th>
                                                <th>Product</th>
                                                <th>VN</th>
                                                <th>Lines</th>
                                                <th>MRC</th>
                                                <th>Acct. Manager</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sales.filter(item => {
                                                if (!searchQuery) return true;
                                                const lower = searchQuery.toLowerCase();
                                                return (
                                                    item.customerName?.toLowerCase().includes(lower) ||
                                                    item.productName?.toLowerCase().includes(lower) ||
                                                    item.virtualNumber?.toLowerCase().includes(lower) ||
                                                    item.agentName?.toLowerCase().includes(lower)
                                                );
                                            }).map(sale => (
                                                <tr key={sale._id}>
                                                    <td className="text-center">{new Date(sale.date).toLocaleDateString()}</td>
                                                    <td className="text-center"><small>{sale.orderType || '-'}</small></td>
                                                    <td className="fw-bold">{sale.customerName}</td>
                                                    <td>{sale.productName}</td>
                                                    <td className="text-primary text-center fw-bold">{sale.virtualNumber || '-'}</td>
                                                    <td className="text-center">{sale.numberOfLines}</td>
                                                    <td className="text-end text-success fw-bold">${Number(sale.mrc).toLocaleString()}</td>
                                                    <td>
                                                        <span className="fw-bold">{sale.agentName || sale.salesPerson?.name}</span>
                                                        {sale.salesPerson?.title && (
                                                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                                {sale.salesPerson.title} {sale.salesPerson.name === 'Huzefa' ? '(Under Tabrez)' : ''}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="text-center">
                                                        <span className={`badge ${sale.status === 'Billed' ? 'bg-success' :
                                                            sale.status === 'Executed' ? 'bg-primary' : 'bg-warning text-dark'
                                                            }`}>
                                                            {sale.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="btn-group">
                                                            {hasPermission('UPDATE') && (user?.role === 'admin' || user?.isSalesManager || (sale.salesPerson && (sale.salesPerson._id === user?.id || sale.salesPerson === user?.id))) && (
                                                                <button className="btn btn-xs btn-outline-primary" onClick={() => openEditModal(sale)}>
                                                                    <i className="bi bi-pencil"></i>
                                                                </button>
                                                            )}
                                                            {hasPermission('DELETE') && (user?.role === 'admin' || user?.isSalesManager || (sale.salesPerson && (sale.salesPerson._id === user?.id || sale.salesPerson === user?.id))) && (
                                                                <button className="btn btn-xs btn-outline-danger ms-1" onClick={() => handleDelete(sale._id)}>
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {sales.length === 0 && <tr><td colSpan="10" className="text-center py-3">No Data Available</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* DOCUMENTS TAB */}
                            <div className="tab-pane fade" id="sales-docs" role="tabpanel">
                                <div className="p-3">
                                    <DepartmentDocuments department="sales" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CREATE/EDIT MODAL */}
                {showModal && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-xl">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title">{isEditing ? 'Edit Sale' : 'New Sale Entry'}</h5>
                                    <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="row g-3">
                                            {/* SECTION 1: BASIC INFO */}
                                            <div className="col-12"><h6 className="text-primary border-bottom pb-2">Order Details</h6></div>

                                            <div className="col-md-3">
                                                <label className="form-label small fw-bold">Order Type</label>
                                                <select className="form-select form-select-sm" name="orderType" value={formData.orderType} onChange={handleInputChange}>
                                                    <option>New Sale</option>
                                                    <option>Upgrade</option>
                                                    <option>Downgrade</option>
                                                    <option>Renewal</option>
                                                    <option>Continuing</option>
                                                </select>
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label small fw-bold">Date</label>
                                                <input type="date" className="form-control form-select-sm" name="date" value={formData.date} onChange={handleInputChange} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">Virtual Number (VN)</label>
                                                <input type="text" className="form-control form-select-sm" name="virtualNumber" value={formData.virtualNumber} onChange={handleInputChange} placeholder="e.g., +123456789" />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">Account Manager</label>
                                                <input type="text" className="form-control form-select-sm" name="agentName" value={formData.agentName} onChange={handleInputChange} placeholder="Agent Name" />
                                            </div>

                                            {/* SECTION 2: CUSTOMER & PRODUCT */}
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">Customer Name <span className="text-danger">*</span></label>
                                                <input type="text" className="form-control form-select-sm" name="customerName" value={formData.customerName} onChange={handleInputChange} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">Product / Plan <span className="text-danger">*</span></label>
                                                <input type="text" className="form-control form-select-sm" name="productName" value={formData.productName} onChange={handleInputChange} required />
                                            </div>

                                            {/* SECTION 3: FINANCIALS */}
                                            <div className="col-md-3">
                                                <label className="form-label small fw-bold">Num. Lines</label>
                                                <input type="number" className="form-control form-select-sm" name="numberOfLines" value={formData.numberOfLines} onChange={handleInputChange} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label small fw-bold">MRC ($)</label>
                                                <input type="number" className="form-control form-select-sm" name="mrc" value={formData.mrc} onChange={handleInputChange} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label small fw-bold">Initial Recharge ($)</label>
                                                <input type="number" className="form-control form-select-sm" name="initialRecharge" value={formData.initialRecharge} onChange={handleInputChange} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label small fw-bold">One-time Amount ($)</label>
                                                <input type="number" className="form-control form-select-sm" name="amount" value={formData.amount} onChange={handleInputChange} required />
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label small fw-bold">Remarks</label>
                                                <textarea className="form-control form-select-sm" name="remarks" rows="2" value={formData.remarks} onChange={handleInputChange}></textarea>
                                            </div>

                                            {/* FOLLOW UP */}
                                            <div className="col-12 mt-4"><h6 className="text-warning border-bottom pb-2">Follow-up Info</h6></div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold">Next Follow-up</label>
                                                <input type="date" className="form-control form-select-sm" name="followUpDate" value={formData.followUpDate} onChange={handleInputChange} />
                                            </div>
                                            <div className="col-md-8">
                                                <label className="form-label small fw-bold">Notes</label>
                                                <input type="text" className="form-control form-select-sm" name="followUpNotes" value={formData.followUpNotes} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer bg-light">
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Close</button>
                                        <button type="submit" className="btn btn-primary btn-sm">{isEditing ? 'Save Changes' : 'Create Sale'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section >
    );
};

export default SalesModule;

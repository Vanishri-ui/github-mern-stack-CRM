import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';
import DepartmentDocuments from '../components/DepartmentDocuments';

const FinanceModule = () => {
    const { user } = useContext(AuthContext);
    const { searchQuery } = useContext(SearchContext);
    const [sales, setSales] = useState([]);
    const [activeTab, setActiveTab] = useState('revenue'); // revenue, am_perf, docs
    const [perfFilter, setPerfFilter] = useState('All'); // All, Today, Month

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        customerName: '',
        productName: '',
        amount: '',
        agentName: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Paid',
        mrc: '0',
        initialRecharge: '0'
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

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to PERMANENTLY delete this record?')) {
            try {
                await axios.delete(`/api/sales/${id}`);
                fetchData();
            } catch (e) {
                alert('Error deleting record');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/sales', formData);
            setShowModal(false);
            setFormData({ customerName: '', productName: '', amount: '', agentName: '', date: new Date().toISOString().split('T')[0], status: 'Paid', mrc: '0', initialRecharge: '0' });
            fetchData();
        } catch (e) {
            alert('Error creating record');
        }
    };

    const hasPermission = (perm) => user.role === 'admin' || user.permissions?.includes(perm) || user.isDepartmentHead;

    // --- CALCULATIONS ---
    const totalRevenue = sales.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalBilled = sales.filter(s => s.status === 'Billed' || s.status === 'Paid').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalCollected = sales.filter(s => s.status === 'Paid').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const pendingCollection = totalBilled - totalCollected;

    // --- AM PERFORMANCE ---
    const amPerformance = sales.reduce((acc, curr) => {
        // Only count 'Paid' sales as performance
        if (curr.status !== 'Paid') return acc;

        // Date Filtering based on Sale Date
        const sDate = new Date(curr.date);
        const today = new Date();

        if (perfFilter === 'Today') {
            if (sDate.toLocaleDateString() !== today.toLocaleDateString()) return acc;
        } else if (perfFilter === 'Month') {
            if (sDate.getMonth() !== today.getMonth() || sDate.getFullYear() !== today.getFullYear()) return acc;
        }

        const amName = curr.agentName || curr.salesPerson?.name || 'Unassigned';
        if (!acc[amName]) {
            acc[amName] = {
                name: amName,
                revenue: 0,
                newSalesRevenue: 0,
                upgradeRevenue: 0,
                mrc: 0,
                recharge: 0,
                customers: new Set(),
                salesList: []
            };
        }

        const amount = Number(curr.amount) || 0;
        acc[amName].revenue += amount;

        if (curr.orderType === 'Upgrade') {
            acc[amName].upgradeRevenue += amount;
        } else if (curr.orderType === 'New Sale') {
            acc[amName].newSalesRevenue += amount;
        }

        acc[amName].mrc += (Number(curr.mrc) || 0);
        acc[amName].recharge += (Number(curr.initialRecharge) || 0);

        if (curr.customerName) {
            acc[amName].customers.add(curr.customerName);
            acc[amName].salesList.push({
                customer: curr.customerName,
                amount: amount,
                mrc: Number(curr.mrc) || 0,
                orderType: curr.orderType || 'New Sale',
                date: sDate.toLocaleDateString()
            });
        }
        return acc;
    }, {});

    const amPerformanceArray = Object.values(amPerformance).map(am => ({
        ...am,
        customerCount: am.customers.size
    })).sort((a, b) => b.revenue - a.revenue);

    // --- MAIN DASHBOARD VIEW ---
    return (
        <section className="content-header">
            <div className="container-fluid">
                <div className="row mb-3 align-items-center">
                    <div className="col-md-6"><h1>Finance Overview</h1></div>
                    <div className="col-md-6 text-end">
                        {hasPermission('CREATE') && (
                            <button className="btn btn-primary shadow-sm" onClick={() => setShowModal(true)}>
                                <i className="bi bi-plus-lg me-1"></i> Add Record
                            </button>
                        )}
                    </div>
                </div>

                {/* STATS CARDS */}
                <div className="row mb-4">
                    <div className="col-md-3 col-sm-6 col-12">
                        <div className="info-box shadow-sm">
                            <span className="info-box-icon bg-info"><i className="bi bi-graph-up"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Total Sales Value</span>
                                <span className="info-box-number">${totalRevenue.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-12">
                        <div className="info-box shadow-sm">
                            <span className="info-box-icon bg-success"><i className="bi bi-cash-stack"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Collected Revenue</span>
                                <span className="info-box-number">${totalCollected.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-12">
                        <div className="info-box shadow-sm">
                            <span className="info-box-icon bg-warning"><i className="bi bi-hourglass-split"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Pending Collection</span>
                                <span className="info-box-number">${pendingCollection.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-12">
                        <div className="info-box shadow-sm">
                            <span className="info-box-icon bg-danger"><i className="bi bi-receipt"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Total Invoiced</span>
                                <span className="info-box-number">${totalBilled.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABS */}
                <div className="card card-primary card-outline card-outline-tabs shadow-sm">
                    <div className="card-header p-0 border-bottom-0">
                        <ul className="nav nav-tabs" id="custom-tabs-four-tab" role="tablist">
                            <li className="nav-item">
                                <span className={`nav-link ${activeTab === 'revenue' ? 'active' : ''}`} role="button" onClick={() => setActiveTab('revenue')}>
                                    <i className="bi bi-table me-2"></i>Revenue Ledger
                                </span>
                            </li>
                            <li className="nav-item">
                                <span className={`nav-link ${activeTab === 'am_perf' ? 'active' : ''}`} role="button" onClick={() => setActiveTab('am_perf')}>
                                    <i className="bi bi-person-badge me-2"></i>AM Performance
                                </span>
                            </li>
                            <li className="nav-item">
                                <span className={`nav-link ${activeTab === 'docs' ? 'active' : ''}`} role="button" onClick={() => setActiveTab('docs')}>
                                    <i className="bi bi-folder2-open me-2"></i>Finance Documents
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="card-body p-0">

                        {/* REVENUE TABLE */}
                        {activeTab === 'revenue' && (
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped table-hover table-sm text-nowrap align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                                    <thead className="table-light text-center">
                                        <tr>
                                            <th>Date</th>
                                            <th>Customer Name</th>
                                            <th>Product</th>
                                            <th>Sales Agent</th>
                                            <th>Status</th>
                                            <th>Amount</th>
                                            {hasPermission('DELETE') && <th>Action</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sales.length === 0 ? (
                                            <tr><td colSpan="6" className="text-center py-4 text-muted">No sales records found.</td></tr>
                                        ) : (
                                            sales.filter(s => !searchQuery || s.customerName.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                                                <tr key={s._id}>
                                                    <td className="text-center">{new Date(s.date).toLocaleDateString()}</td>
                                                    <td className="fw-bold">{s.customerName}</td>
                                                    <td>{s.productName}</td>
                                                    <td>{s.agentName || s.salesPerson?.name || '-'}</td>
                                                    <td className="text-center">
                                                        <span className={`badge ${s.status === 'Paid' ? 'bg-success' : s.status === 'Billed' ? 'bg-warning text-dark' : s.status === 'Executed' ? 'bg-primary' : 'bg-secondary'}`}>
                                                            {s.status === 'Paid' ? 'PAID' : s.status === 'Billed' ? 'Invoice Sent' : s.status || 'Draft'}
                                                        </span>
                                                    </td>
                                                    <td className="text-end fw-bold">${s.amount.toLocaleString()}</td>
                                                    {hasPermission('DELETE') && (
                                                        <td className="text-center">
                                                            <button className="btn btn-xs btn-outline-danger" onClick={() => handleDelete(s._id)}>
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
                        )}
                        {/* AM PERFORMANCE REPORT VIEW */}
                        {activeTab === 'am_perf' && (
                            <div className="table-responsive">
                                <div className="bg-light p-2 border-bottom d-flex justify-content-between align-items-center">
                                    <span className="fw-bold small text-muted text-uppercase ms-2">Performance Period: {perfFilter}</span>
                                    <div className="btn-group btn-group-sm me-2">
                                        <button className={`btn btn-outline-secondary ${perfFilter === 'Today' ? 'active' : ''}`} onClick={() => setPerfFilter('Today')}>Today</button>
                                        <button className={`btn btn-outline-secondary ${perfFilter === 'Month' ? 'active' : ''}`} onClick={() => setPerfFilter('Month')}>This Month</button>
                                        <button className={`btn btn-outline-secondary ${perfFilter === 'All' ? 'active' : ''}`} onClick={() => setPerfFilter('All')}>All Time</button>
                                    </div>
                                </div>
                                <table className="table table-bordered table-sm align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                                    <thead className="table-dark text-center">
                                        <tr>
                                            <th className="text-start ps-3">Account Manager / Customer Breakdown</th>
                                            <th>Total Revenue</th>
                                            <th>New Sales</th>
                                            <th>Upgrades</th>
                                            <th>MRC</th>
                                        </tr>
                                    </thead>
                                    {amPerformanceArray.length === 0 ? (
                                        <tbody><tr><td colSpan="5" className="text-center py-4 text-muted">No billed sales data available for performance metrics.</td></tr></tbody>
                                    ) : (
                                        amPerformanceArray.map((am, idx) => (
                                            <tbody key={idx} className="border-bottom">
                                                <tr className="table-info">
                                                    <td className="fw-bold ps-3 py-2">
                                                        <i className="bi bi-person-badge-fill me-2"></i> {am.name.toUpperCase()}
                                                    </td>
                                                    <td className="text-end fw-bold text-dark px-3">${am.revenue.toLocaleString()}</td>
                                                    <td className="text-end fw-bold text-primary px-3">${am.newSalesRevenue.toLocaleString()}</td>
                                                    <td className="text-end fw-bold text-purple px-3" style={{ color: '#6f42c1' }}>${am.upgradeRevenue.toLocaleString()}</td>
                                                    <td className="text-end fw-bold text-dark px-3">${am.mrc.toLocaleString()}</td>
                                                </tr>
                                                {am.salesList.map((sale, sIdx) => (
                                                    <tr key={`${idx}-${sIdx}`} style={{ fontSize: '0.85rem' }}>
                                                        <td className="ps-5 text-muted">
                                                            {sIdx + 1}. {sale.customer} <span className="badge bg-secondary ms-2" style={{ fontSize: '0.65rem' }}>{sale.orderType}</span>
                                                        </td>
                                                        <td className="text-end text-success px-3">${sale.amount.toLocaleString()}</td>
                                                        <td className="text-end text-muted px-3 small">{sale.orderType === 'New Sale' ? 'Yes' : '-'}</td>
                                                        <td className="text-end text-muted px-3 small">{sale.orderType === 'Upgrade' ? 'Yes' : '-'}</td>
                                                        <td className="text-end text-info px-3">${sale.mrc.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-light">
                                                    <td className="text-end fw-bold pe-3">TOTAL PERFORMANCE FOR {am.name.toUpperCase()}</td>
                                                    <td className="text-end fw-bold text-success px-3 border-top border-2">${am.revenue.toLocaleString()}</td>
                                                    <td className="text-end fw-bold text-primary px-3 border-top border-2">${am.newSalesRevenue.toLocaleString()}</td>
                                                    <td className="text-end fw-bold px-3 border-top border-2" style={{ color: '#6f42c1' }}>${am.upgradeRevenue.toLocaleString()}</td>
                                                    <td className="text-end fw-bold text-info px-3 border-top border-2">${am.mrc.toLocaleString()}</td>
                                                </tr>
                                            </tbody>
                                        ))
                                    )}
                                </table>
                            </div>
                        )}

                        {/* DOCUMENTS TAB */}
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
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title">Add Finance Record</h5>
                                    <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">Customer Name</label>
                                                <input type="text" className="form-control" name="customerName" value={formData.customerName} onChange={handleInputChange} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">Product</label>
                                                <input type="text" className="form-control" name="productName" value={formData.productName} onChange={handleInputChange} required />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold">Amount ($)</label>
                                                <input type="number" className="form-control" name="amount" value={formData.amount} onChange={handleInputChange} required />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold">Agent Name</label>
                                                <input type="text" className="form-control" name="agentName" value={formData.agentName} onChange={handleInputChange} />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold">Date</label>
                                                <input type="date" className="form-control" name="date" value={formData.date} onChange={handleInputChange} required />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold">MRC ($)</label>
                                                <input type="number" className="form-control" name="mrc" value={formData.mrc} onChange={handleInputChange} />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold">Initial Recharge ($)</label>
                                                <input type="number" className="form-control" name="initialRecharge" value={formData.initialRecharge} onChange={handleInputChange} />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold">Status</label>
                                                <select className="form-select" name="status" value={formData.status} onChange={handleInputChange}>
                                                    <option>Paid</option>
                                                    <option>Billed</option>
                                                    <option>Executed</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                                        <button type="submit" className="btn btn-primary">Save Record</button>
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

export default FinanceModule;

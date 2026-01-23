import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';
import DepartmentDocuments from '../components/DepartmentDocuments';

const FinanceModule = () => {
    const { user } = useContext(AuthContext);
    const { searchQuery } = useContext(SearchContext);
    const [sales, setSales] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [activeTab, setActiveTab] = useState('revenue'); // revenue, am_perf, docs
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [salesRes, invRes] = await Promise.all([
                axios.get('/api/sales'),
                axios.get('/api/invoices')
            ]);
            setSales(salesRes.data);
            setInvoices(invRes.data);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    // --- CALCULATIONS ---
    const totalRevenue = sales.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalBilled = invoices.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const totalCollected = invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const pendingCollection = totalBilled - totalCollected;

    // --- AM PERFORMANCE ---
    const amPerformance = sales.reduce((acc, curr) => {
        // Only count 'Paid' sales as performance
        if (curr.status !== 'Paid') return acc;

        const amName = curr.agentName || curr.salesPerson?.name || 'Unassigned';
        if (!acc[amName]) {
            acc[amName] = { name: amName, revenue: 0, mrc: 0, recharge: 0, customers: new Set(), salesList: [] };
        }
        acc[amName].revenue += (Number(curr.amount) || 0);
        acc[amName].mrc += (Number(curr.mrc) || 0);
        acc[amName].recharge += (Number(curr.initialRecharge) || 0);
        if (curr.customerName) {
            acc[amName].customers.add(curr.customerName);
            acc[amName].salesList.push({
                customer: curr.customerName,
                amount: Number(curr.amount) || 0,
                mrc: Number(curr.mrc) || 0
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
                <div className="row mb-3">
                    <div className="col-md-6"><h1>Finance Overview</h1></div>
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
                                <a className={`nav-link ${activeTab === 'revenue' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('revenue')}>
                                    <i className="bi bi-table me-2"></i>Revenue Ledger
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className={`nav-link ${activeTab === 'am_perf' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('am_perf')}>
                                    <i className="bi bi-person-badge me-2"></i>AM Performance
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className={`nav-link ${activeTab === 'docs' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('docs')}>
                                    <i className="bi bi-folder2-open me-2"></i>Finance Documents
                                </a>
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
                                <table className="table table-bordered table-sm align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                                    <thead className="table-dark text-center">
                                        <tr>
                                            <th className="text-start ps-3">Account Manager / Customer Breakdown</th>
                                            <th>Revenue</th>
                                            <th>MRC</th>
                                            <th>Initial Recharge</th>
                                        </tr>
                                    </thead>
                                    {amPerformanceArray.length === 0 ? (
                                        <tbody><tr><td colSpan="4" className="text-center py-4 text-muted">No billed sales data available for performance metrics.</td></tr></tbody>
                                    ) : (
                                        amPerformanceArray.map((am, idx) => (
                                            <tbody key={idx} className="border-bottom">
                                                <tr className="table-info">
                                                    <td className="fw-bold ps-3 py-2">
                                                        <i className="bi bi-person-badge-fill me-2"></i> {am.name.toUpperCase()}
                                                    </td>
                                                    <td className="text-end fw-bold text-dark px-3">${am.revenue.toLocaleString()}</td>
                                                    <td className="text-end fw-bold text-dark px-3">${am.mrc.toLocaleString()}</td>
                                                    <td className="text-end fw-bold text-dark px-3">${am.recharge.toLocaleString()}</td>
                                                </tr>
                                                {am.salesList.map((sale, sIdx) => (
                                                    <tr key={`${idx}-${sIdx}`} style={{ fontSize: '0.85rem' }}>
                                                        <td className="ps-5 text-muted">
                                                            {sIdx + 1}. {sale.customer}
                                                        </td>
                                                        <td className="text-end text-success px-3">${sale.amount.toLocaleString()}</td>
                                                        <td className="text-end text-info px-3">${sale.mrc.toLocaleString()}</td>
                                                        <td className="text-center text-muted px-3 small">-</td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-light">
                                                    <td className="text-end fw-bold pe-3">TOTAL PERFORMANCE FOR {am.name.toUpperCase()}</td>
                                                    <td className="text-end fw-bold text-success px-3 border-top border-2">${am.revenue.toLocaleString()}</td>
                                                    <td className="text-end fw-bold text-info px-3 border-top border-2">${am.mrc.toLocaleString()}</td>
                                                    <td className="text-end fw-bold text-warning px-3 border-top border-2">${am.recharge.toLocaleString()}</td>
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
            </div>
        </section>
    );
};

export default FinanceModule;

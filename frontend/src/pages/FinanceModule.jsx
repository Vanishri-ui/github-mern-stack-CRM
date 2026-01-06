import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';

const FinanceModule = () => {
    const { user } = useContext(AuthContext);
    const [sales, setSales] = useState([]);
    const { searchQuery } = useContext(SearchContext);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = () => {
        axios.get('/api/sales').then(res => setSales(res.data)).catch(console.error);
    }

    const markBilled = async (id) => {
        if (window.confirm("Confirm Billing & Invoice Generation?")) {
            try {
                await axios.put(`/api/sales/${id}`, { status: 'Billed' });
                fetchSales();
            } catch (e) { alert("Error"); }
        }
    }

    const readyToBill = sales.filter(s => s.status === 'Executed');
    const billedHistory = sales.filter(s => s.status === 'Billed');

    return (
        <section className="content-header">
            <div className="container-fluid">
                <div className="row mb-2">
                    <div className="col-sm-6"><h1>Finance & Billing</h1></div>
                </div>

                <div className="row">
                    <div className="col-lg-4 col-6">
                        <div className="info-box bg-success">
                            <span className="info-box-icon"><i className="bi bi-cash-stack"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Total Receivables</span>
                                <span className="info-box-number">${billedHistory.reduce((a, b) => a + b.amount, 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BILLING QUEUE */}
                <div className="card card-outline card-success">
                    <div className="card-header">
                        <h3 className="card-title">Ready for Billing (Executed Orders)</h3>
                        <div className="card-tools">
                            {/* Global Search Used */}
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {readyToBill.filter(inv => {
                                    if (!searchQuery) return true;
                                    const lower = searchQuery.toLowerCase();
                                    return (
                                        inv.customerName?.toLowerCase().includes(lower) ||
                                        inv.amount?.toString().includes(lower)
                                    );
                                }).length === 0 && <tr><td colSpan="4">No matching orders.</td></tr>}
                                {readyToBill.filter(inv => {
                                    if (!searchQuery) return true;
                                    const lower = searchQuery.toLowerCase();
                                    return (
                                        inv.customerName?.toLowerCase().includes(lower) ||
                                        inv.amount?.toString().includes(lower)
                                    );
                                }).map((inv) => (
                                    <tr key={inv._id}>
                                        <td>{inv.customerName}</td>
                                        <td>{new Date(inv.date).toLocaleDateString()}</td>
                                        <td>${inv.amount.toLocaleString()}</td>
                                        <td>
                                            <button className="btn btn-sm btn-success" onClick={() => markBilled(inv._id)}>
                                                <i className="bi bi-receipt"></i> Generate Invoice
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* BILLING HISTORY */}
                <div className="card collapsed-card">
                    <div className="card-header">
                        <h3 className="card-title">Billing History</h3>
                        <div className="card-tools"><button type="button" className="btn btn-tool" data-lte-toggle="card-collapse"><i className="bi bi-plus"></i></button></div>
                    </div>
                    <div className="card-body p-0">
                        <table className="table table-striped">
                            <thead><tr><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
                            <tbody>
                                {billedHistory.filter(inv => {
                                    if (!searchQuery) return true;
                                    const lower = searchQuery.toLowerCase();
                                    return (inv.customerName?.toLowerCase().includes(lower));
                                }).map((inv) => (
                                    <tr key={inv._id}>
                                        <td>{inv.customerName}</td>
                                        <td>${inv.amount.toLocaleString()}</td>
                                        <td><span className="badge bg-success">Billed / Paid</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FinanceModule;

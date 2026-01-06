import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';

const OperationsModule = () => {
    const { user } = useContext(AuthContext);
    const { searchQuery } = useContext(SearchContext);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/sales');
            setOrders(res.data);
        } catch (e) { console.error(e); }
    };

    const updateStatus = async (id, newStatus) => {
        if (window.confirm(`Mark order as ${newStatus}?`)) {
            try {
                await axios.put(`/api/sales/${id}`, { status: newStatus });
                fetchOrders();
            } catch (e) { alert('Failed to update status'); }
        }
    };

    // Filter Logic
    const pendingOrders = orders.filter(o => o.status === 'Pending Execution' || !o.status); // Handle legacy
    const executedOrders = orders.filter(o => o.status === 'Executed');

    return (
        <section className="content-header">
            <div className="container-fluid">
                <div className="row mb-2">
                    <div className="col-sm-6"><h1>Order Execution (Operations)</h1></div>
                    <div className="col-sm-6">
                        {/* Global Search is used */}
                    </div>
                </div>

                {/* PENDING ORDERS */}
                <div className="card card-primary card-outline">
                    <div className="card-header">
                        <h3 className="card-title">Pending Orders <span className="badge bg-warning">{pendingOrders.length}</span></h3>
                    </div>
                    <div className="card-body table-responsive p-0">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Product</th>
                                    <th>Amount</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingOrders.filter(o => {
                                    if (!searchQuery) return true;
                                    const lower = searchQuery.toLowerCase();
                                    return (
                                        o.customerName?.toLowerCase().includes(lower) ||
                                        o.productName?.toLowerCase().includes(lower) ||
                                        o.amount?.toString().includes(lower)
                                    );
                                }).length === 0 && <tr><td colSpan="5">No matching orders.</td></tr>}
                                {pendingOrders.filter(o => {
                                    if (!searchQuery) return true;
                                    const lower = searchQuery.toLowerCase();
                                    return (
                                        o.customerName?.toLowerCase().includes(lower) ||
                                        o.productName?.toLowerCase().includes(lower) ||
                                        o.amount?.toString().includes(lower)
                                    );
                                }).map(o => (
                                    <tr key={o._id}>
                                        <td>{new Date(o.date).toLocaleDateString()}</td>
                                        <td>{o.customerName}</td>
                                        <td>{o.productName}</td>
                                        <td>${o.amount}</td>
                                        <td>
                                            <button className="btn btn-sm btn-primary" onClick={() => updateStatus(o._id, 'Executed')}>
                                                <i className="bi bi-gear-wide-connected"></i> Execute Order
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* HISTORY */}
                <div className="card card-secondary collapsed-card">
                    <div className="card-header">
                        <h3 className="card-title">Execution History</h3>
                        <div className="card-tools"><button type="button" className="btn btn-tool" data-lte-toggle="card-collapse"><i className="bi bi-plus"></i></button></div>
                    </div>
                    <div className="card-body table-responsive p-0">
                        <table className="table table-sm">
                            <thead><tr><th>ID</th><th>Customer</th><th>Status</th></tr></thead>
                            <tbody>
                                {executedOrders.filter(o => {
                                    if (!searchQuery) return true;
                                    const lower = searchQuery.toLowerCase();
                                    return (o.customerName?.toLowerCase().includes(lower));
                                }).map(o => (
                                    <tr key={o._id}>
                                        <td>...{o._id.slice(-4)}</td>
                                        <td>{o.customerName}</td>
                                        <td><span className="badge bg-success">Executed</span></td>
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

export default OperationsModule;

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';
import DepartmentDocuments from '../components/DepartmentDocuments';

const ExecutionModule = () => {
    const { user } = useContext(AuthContext);
    const { searchQuery } = useContext(SearchContext);
    const [orders, setOrders] = useState([]);

    // Manual Work Order State
    const [showWOModal, setShowWOModal] = useState(false);
    const [woCustomer, setWOCustomer] = useState('');
    const [woProduct, setWOProduct] = useState('');
    const [woAmount, setWOAmount] = useState('');
    const [woLines, setWOLines] = useState('');

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

    // Create Work Order
    const handleCreateWO = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/sales', {
                customerName: woCustomer,
                productName: woProduct,
                amount: Number(woAmount),
                serviceLines: woLines,
                status: 'Pending Execution',
                agentName: 'Execution Team Manual Entry'
            });
            setShowWOModal(false);
            setWOCustomer(''); setWOProduct(''); setWOAmount(''); setWOLines('');
            fetchOrders();
        } catch (e) { alert('Failed to create Work Order'); }
    };

    const getWorkOrderNumber = (id, index) => `WO-${String(index + 1).padStart(4, '0')}`;

    // Filter Logic
    const pendingOrders = orders.filter(o => o.status === 'Pending Execution' || !o.status);
    const executedOrders = orders.filter(o => o.status === 'Executed' || o.status === 'Billed');

    return (
        <section className="content-header">
            <div className="container-fluid">
                <div className="row mb-2">
                    <div className="col-sm-6"><h1>Execution Department</h1></div>
                    <div className="col-sm-6 text-end">
                        <button className="btn btn-primary" onClick={() => setShowWOModal(true)}>
                            <i className="bi bi-plus-lg"></i> Create Work Order
                        </button>
                    </div>
                </div>

                {/* STATS ROW */}
                <div className="row mb-3">
                    <div className="col-md-4">
                        <div className="info-box shadow-sm">
                            <span className="info-box-icon bg-warning"><i className="bi bi-hourglass-split"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Pending Execution</span>
                                <span className="info-box-number">{pendingOrders.length}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="info-box shadow-sm">
                            <span className="info-box-icon bg-success"><i className="bi bi-check2-all"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Executed Orders</span>
                                <span className="info-box-number">{executedOrders.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PENDING ORDERS */}
                <div className="card card-warning card-outline">
                    <div className="card-header">
                        <h3 className="card-title">Pending Orders (Action Required)</h3>
                    </div>
                    <div className="card-body table-responsive p-0">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>WO #</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Product</th>
                                    <th>Lines</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingOrders.filter(o => {
                                    if (!searchQuery) return true;
                                    const lower = searchQuery.toLowerCase();
                                    return (o.customerName?.toLowerCase().includes(lower));
                                }).map((o, index) => (
                                    <tr key={o._id}>
                                        <td>{getWorkOrderNumber(o._id, index)}</td>
                                        <td>{new Date(o.date).toLocaleDateString()}</td>
                                        <td>{o.customerName}</td>
                                        <td>{o.productName}</td>
                                        <td>{o.serviceLines || '-'}</td>
                                        <td>
                                            <button className="btn btn-sm btn-success" onClick={() => updateStatus(o._id, 'Executed')}>
                                                <i className="bi bi-play-fill"></i> Execute
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* HISTORY */}
                <div className="card card-secondary card-outline collapsed-card">
                    <div className="card-header">
                        <h3 className="card-title">Execution History</h3>
                        <div className="card-tools"><button type="button" className="btn btn-tool" data-lte-toggle="card-collapse"><i className="bi bi-plus"></i></button></div>
                    </div>
                    <div className="card-body table-responsive p-0" style={{ display: 'none' }}> {/* AdminLTE toggle logic handles display, but adding style just in case */}
                        <table className="table table-sm">
                            <thead>
                                <tr>
                                    <th>WO #</th>
                                    <th>Customer</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {executedOrders.map((o, index) => (
                                    <tr key={o._id}>
                                        <td>WO-{String(index + 1).padStart(4, '0')}</td>
                                        <td>{o.customerName}</td>
                                        <td><span className="badge bg-success">{o.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* DOCUMENTS SECTION */}
                <div className="row mt-4">
                    <div className="col-12">
                        <DepartmentDocuments department="execution" />
                    </div>
                </div>

                {/* MANUAL WO MODAL */}
                {showWOModal && (
                    <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Create Work Order</h5>
                                    <button className="btn-close" onClick={() => setShowWOModal(false)}></button>
                                </div>
                                <form onSubmit={handleCreateWO}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label>Customer Name</label>
                                            <input type="text" className="form-control" value={woCustomer} onChange={e => setWOCustomer(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label>Product / Service Details</label>
                                            <input type="text" className="form-control" value={woProduct} onChange={e => setWOProduct(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label>Number of Lines</label>
                                            <input type="text" className="form-control" value={woLines} onChange={e => setWOLines(e.target.value)} placeholder="e.g. 5 Lines" />
                                        </div>
                                        <div className="mb-3">
                                            <label>Amount (Optional)</label>
                                            <input type="number" className="form-control" value={woAmount} onChange={e => setWOAmount(e.target.value)} placeholder="0.00" />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
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

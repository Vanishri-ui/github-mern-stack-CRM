import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';
import DepartmentDocuments from '../components/DepartmentDocuments';

const SupportModule = () => {
    const { user } = useContext(AuthContext);
    const { searchQuery } = useContext(SearchContext);
    const [tickets, setTickets] = useState([]);
    const [sales, setSales] = useState([]); // For dropdown
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    // New Fields
    const [linkedSale, setLinkedSale] = useState('');
    const [productName, setProductName] = useState('');
    const [serviceLines, setServiceLines] = useState('');

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

    const fetchTickets = async () => { /* Kept for refresh after update */
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

    return (
        <section className="content-header">
            <div className="container-fluid">
                <div className="row mb-2">
                    <div className="col-sm-6"><h1>Support Tickets</h1></div>
                    <div className="col-sm-6 text-end">
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <i className="bi bi-plus-lg"></i> Create Ticket
                        </button>
                    </div>
                </div>

                <div className="card card-outline card-warning">
                    <div className="card-header">
                        <h3 className="card-title">Ticket List</h3>
                        <div className="card-tools">
                            <div className="input-group input-group-sm" style={{ width: '200px' }}>
                                {/* Global Search Used */}
                            </div>
                        </div>
                    </div>
                    <div className="card-body table-responsive p-0">
                        <table className="table table-hover text-nowrap">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Subject</th>
                                    <th>Product Reference</th> { /* NEW */}
                                    <th>Priority</th>
                                    <th>Raised By</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && <tr><td colSpan="5">Loading...</td></tr>}
                                {!loading && tickets.filter(t => {
                                    if (!searchQuery) return true;
                                    const lower = searchQuery.toLowerCase();
                                    return (
                                        t.title?.toLowerCase().includes(lower) ||
                                        t.description?.toLowerCase().includes(lower) ||
                                        t.priority?.toLowerCase().includes(lower) ||
                                        t.status?.toLowerCase().includes(lower) ||
                                        (t.user && t.user.name?.toLowerCase().includes(lower))
                                    );
                                }).map(t => (
                                    <tr key={t._id}>
                                        <td>
                                            <span className={`badge ${t.status === 'Resolved' ? 'bg-success' : 'bg-warning'}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td>
                                            <strong>{t.title}</strong><br />
                                            <small className="text-muted">{t.description}</small>
                                        </td>
                                        <td>
                                            {t.productName ? (
                                                <div>
                                                    <span className="fw-bold">{t.productName}</span><br />
                                                    <small className="text-muted">{t.serviceLines} Lines</small>
                                                </div>
                                            ) : <span className="text-muted">-</span>}
                                        </td>
                                        <td>
                                            <span className={`badge ${t.priority === 'High' ? 'bg-danger' : t.priority === 'Medium' ? 'bg-info' : 'bg-secondary'}`}>
                                                {t.priority}
                                            </span>
                                        </td>
                                        <td>{t.user ? t.user.name : 'Unknown'}</td>
                                        <td>
                                            {(user.role === 'admin' || user.department === 'tech') && t.status !== 'Resolved' && (
                                                <button className="btn btn-sm btn-success" onClick={() => handleResolve(t._id)}>
                                                    <i className="bi bi-check-lg"></i> Resolve
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* DOCUMENTS SECTION */}
                <div className="row mt-4">
                    <div className="col-12">
                        <DepartmentDocuments department="tech" />
                    </div>
                </div>

                {showModal && (
                    <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">New Support Ticket</h5>
                                    <button className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        {/* CUSTOMER/SALE SELECTION */}
                                        <div className="mb-3">
                                            <label>Select Existing Customer (Product)</label>
                                            <select className="form-select" onChange={e => {
                                                const saleId = e.target.value;
                                                const sale = sales.find(s => s._id === saleId);
                                                if (sale) {
                                                    setLinkedSale(saleId);
                                                    setProductName(sale.productName);
                                                    setServiceLines(sale.serviceLines || 'N/A');
                                                    setTitle(`Issue with ${sale.productName} (${sale.customerName})`); // Auto-suggest title
                                                } else {
                                                    setLinkedSale('');
                                                    setProductName('');
                                                    setServiceLines('');
                                                }
                                            }}>
                                                <option value="">-- Select Customer --</option>
                                                {sales.map(s => (
                                                    <option key={s._id} value={s._id}>
                                                        {s.customerName} - {s.productName} ({s.date ? new Date(s.date).toLocaleDateString() : 'No Date'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* AUTO-FILLED DETAILS */}
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label>Product</label>
                                                <input className="form-control" value={productName} readOnly disabled />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label>No. of Lines</label>
                                                <input className="form-control" value={serviceLines} readOnly disabled />
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label>Subject / Issue Title</label>
                                            <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label>Priority</label>
                                            <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
                                                <option>Low</option>
                                                <option>Medium</option>
                                                <option>High</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label>Description</label>
                                            <textarea className="form-control" rows="3" value={description} onChange={e => setDescription(e.target.value)}></textarea>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="submit" className="btn btn-warning">Submit Ticket</button>
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

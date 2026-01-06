import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const { searchQuery } = useContext(SearchContext);
    const [documents, setDocuments] = useState([]);
    const [sales, setSales] = useState([]);
    const [tickets, setTickets] = useState([]);


    // Document State
    const [file, setFile] = useState(null);
    const [docTitle, setDocTitle] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Sales State
    const [customerName, setCustomerName] = useState('');
    const [productName, setProductName] = useState('');
    const [amount, setAmount] = useState('');
    const [isSelling, setIsSelling] = useState(false);

    // Ticket State
    const [ticketTitle, setTicketTitle] = useState('');
    const [ticketDesc, setTicketDesc] = useState('');
    const [ticketPriority, setTicketPriority] = useState('Medium');
    const [isTicketing, setIsTicketing] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchDocuments();
            fetchSales();
            fetchTickets();
        }
    }, [user]);

    const fetchDocuments = async () => { try { const res = await axios.get('/api/documents'); setDocuments(res.data); } catch (e) { } };
    const fetchSales = async () => { try { const res = await axios.get('/api/sales'); setSales(res.data); } catch (e) { } };
    const fetchTickets = async () => { try { const res = await axios.get('/api/tickets'); setTickets(res.data); } catch (e) { } };

    // --- HANDLERS ---
    const handleDocUpload = async (e) => {
        e.preventDefault(); if (!file || !docTitle) return;
        const formData = new FormData(); formData.append('file', file); formData.append('title', docTitle);
        setIsUploading(true);
        try { await axios.post('/api/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); setFile(null); setDocTitle(''); fetchDocuments(); } catch (e) { alert('Failed'); }
        setIsUploading(false);
    };

    const handleAddSale = async (e) => {
        e.preventDefault(); setIsSelling(true);
        try { await axios.post('/api/sales', { customerName, productName, amount }); setCustomerName(''); setProductName(''); setAmount(''); fetchSales(); } catch (e) { alert('Failed'); }
        setIsSelling(false);
    };

    const handleDeleteSale = async (id) => { if (window.confirm('Sure?')) try { await axios.delete(`/api/sales/${id}`); fetchSales(); } catch (e) { } };

    const handleRaiseTicket = async (e) => {
        e.preventDefault(); setIsTicketing(true);
        try { await axios.post('/api/tickets', { title: ticketTitle, description: ticketDesc, priority: ticketPriority }); setTicketTitle(''); setTicketDesc(''); fetchTickets(); } catch (e) { alert('Failed'); }
        setIsTicketing(false);
    };

    const handleResolveTicket = async (id) => {
        try { await axios.put(`/api/tickets/${id}`); fetchTickets(); } catch (e) { alert('Failed'); }
    }

    const handleLogout = () => { logout(); navigate('/'); };
    if (!user) return <div style={{ color: 'white' }}>Loading...</div>;

    // --- SEARCH FILTERING ---
    const filteredDocuments = documents.filter(doc => doc.title?.toLowerCase().includes(searchQuery.toLowerCase()));

    // --- STATS ---
    const totalSales = sales.reduce((acc, curr) => acc + curr.amount, 0);
    const openTickets = tickets.filter(t => t.status === 'Open').length;

    return (
        <section className="content">
            {/* DOCUMENT UPLOAD MODAL */}
            <div className="modal fade" id="uploadModal" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Upload Document</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleDocUpload}>
                                <div className="mb-3">
                                    <label className="form-label">Document Title</label>
                                    <input type="text" className="form-control" value={docTitle} onChange={e => setDocTitle(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">File</label>
                                    <input type="file" className="form-control" onChange={e => setFile(e.target.files[0])} required />
                                </div>
                                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal" disabled={isUploading}>{isUploading ? 'Uploading...' : 'Upload'}</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* STATS ROW */}
            <div className="row mb-3">
                <div className="col-lg-3 col-6">
                    <div className="info-box shadow-sm border-0">
                        <span className="info-box-icon text-bg-primary shadow-sm"><i className="bi bi-cart"></i></span>
                        <div className="info-box-content">
                            <span className="info-box-text text-muted">Total Revenue</span>
                            <span className="info-box-number fs-4">${totalSales.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="info-box shadow-sm border-0">
                        <span className="info-box-icon text-bg-success shadow-sm"><i className="bi bi-ticket-detailed"></i></span>
                        <div className="info-box-content">
                            <span className="info-box-text text-muted">Open Tickets</span>
                            <span className="info-box-number fs-4">{openTickets}</span>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-6">
                    <div className="info-box shadow-sm border-0">
                        <span className="info-box-icon text-bg-danger shadow-sm"><i className="bi bi-file-earmark-pdf"></i></span>
                        <div className="info-box-content">
                            <span className="info-box-text text-muted">Documents</span>
                            <span className="info-box-number fs-4">{filteredDocuments.length}</span>
                        </div>
                        <a href="#" className="stretched-link" data-bs-toggle="modal" data-bs-target="#uploadModal"></a>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* LEFT COLUMN - DOCUMENTS */}
                <div className="col-md-6">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h3 className="card-title">Documents</h3>
                        </div>
                        <div className="card-body p-0">
                            {filteredDocuments.length === 0 ? <p className="p-3 text-muted">No documents found.</p> : (
                                <ul className="list-group list-group-flush">
                                    {filteredDocuments.map((doc, idx) => (
                                        <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                            <span>
                                                <i className="bi bi-file-earmark-text me-2"></i>
                                                {doc.title}
                                            </span>
                                            <a href={`/uploads/${doc.filename}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                                                <i className="bi bi-download"></i>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="col-md-6">

                    {/* TICKETS CARD */}
                    <div className="card card-primary card-outline mb-4">
                        <div className="card-header">
                            <h3 className="card-title">Support Tickets</h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleRaiseTicket} className="mb-4">
                                <div className="input-group">
                                    <input type="text" className="form-control" placeholder="Describe issue..." value={ticketTitle} onChange={e => setTicketTitle(e.target.value)} required />
                                    <select className="form-select" style={{ maxWidth: '120px' }} value={ticketPriority} onChange={e => setTicketPriority(e.target.value)}>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                    <button className="btn btn-primary" type="submit" disabled={isTicketing}>Raise Ticket</button>
                                </div>
                            </form>

                            <div className="list-group list-group-flush">
                                {tickets.filter(t => t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || t.description?.toLowerCase().includes(searchQuery.toLowerCase())).map(t => (
                                    <div key={t._id} className="list-group-item">
                                        <div className="d-flex w-100 justify-content-between">
                                            <h6 className="mb-1">{t.title}</h6>
                                            <small className={`badge ${t.status === 'Resolved' ? 'bg-success' : 'bg-danger'}`}>{t.status}</small>
                                        </div>
                                        <p className="mb-1 small text-muted">Priority: {t.priority}</p>
                                        {(user.department === 'tech' || user.role === 'admin') && t.status !== 'Resolved' && (
                                            <button onClick={() => handleResolveTicket(t._id)} className="btn btn-xs btn-outline-success mt-1">Mark Resolved</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SALES CARD (Conditional) */}
                    {(user.role === 'sales' || user.role === 'admin') && (
                        <div className="card card-info mb-4">
                            <div className="card-header">
                                <h3 className="card-title">Latest Sales</h3>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table m-0">
                                        <thead>
                                            <tr>
                                                <th>Customer</th>
                                                <th>Product</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sales.filter(s => s.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || s.productName?.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5).map(s => (
                                                <tr key={s._id}>
                                                    <td>{s.customerName}</td>
                                                    <td>{s.productName}</td>
                                                    <td><span className="badge text-bg-success">${s.amount}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="card-footer clearfix">
                                <button className="btn btn-sm btn-info float-start" onClick={() => navigate('/sales')}>View All Sales</button>
                                <button className="btn btn-sm btn-secondary float-end" onClick={() => navigate('/sales')}>Open Sales Module</button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </section>
    );
};

export default Dashboard;

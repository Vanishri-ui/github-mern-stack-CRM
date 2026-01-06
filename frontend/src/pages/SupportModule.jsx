import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';

const SupportModule = () => {
    const { user } = useContext(AuthContext);
    const { searchQuery } = useContext(SearchContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await axios.get('/api/tickets');
            setTickets(res.data);
            setLoading(false);
        } catch (e) { console.error(e); setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/tickets', { title, description, priority });
            setShowModal(false);
            setTitle(''); setDescription('');
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
                                        <div className="mb-3">
                                            <label>Subject</label>
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

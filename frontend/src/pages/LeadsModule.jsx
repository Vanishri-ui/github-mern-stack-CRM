import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';

const LeadsModule = () => {
    const { user } = useContext(AuthContext);
    const { searchQuery } = useContext(SearchContext);
    const [leads, setLeads] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const stages = ['New', 'Contacted', 'Interested', 'Proposal Sent', 'Negotiation', 'Qualified', 'Closed Won', 'Closed Lost'];
    const sources = ['LinkedIn', 'Cold Call', 'Website', 'Referral', 'WhatsApp', 'Exhibition', 'Other'];

    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        city: '',
        status: 'New',
        source: 'Other',
        estimatedValue: '',
        requirement: '',
        nextFollowUpDate: ''
    });

    const [note, setNote] = useState('');

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await axios.get('/api/leads');
            setLeads(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({
            companyName: '',
            contactPerson: '',
            email: '',
            phone: '',
            city: '',
            status: 'New',
            source: 'Other',
            estimatedValue: '',
            requirement: '',
            nextFollowUpDate: ''
        });
        setNote('');
        setIsEditing(false);
        setCurrentId(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (lead) => {
        setFormData({
            companyName: lead.companyName || '',
            contactPerson: lead.contactPerson || '',
            email: lead.email || '',
            phone: lead.phone || '',
            city: lead.city || '',
            status: lead.status || 'New',
            source: lead.source || 'Other',
            estimatedValue: lead.estimatedValue || '',
            requirement: lead.requirement || '',
            nextFollowUpDate: lead.nextFollowUpDate ? lead.nextFollowUpDate.split('T')[0] : ''
        });
        setIsEditing(true);
        setCurrentId(lead._id);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (note) payload.note = note;

            if (isEditing) {
                await axios.put(`/api/leads/${currentId}`, payload);
            } else {
                await axios.post('/api/leads', payload);
            }
            setShowModal(false);
            fetchLeads();
        } catch (err) {
            alert('Error saving lead');
        }
    };

    const convertToSale = async (id) => {
        if (window.confirm('Convert this lead to an active Sale? Status will change to Closed Won.')) {
            try {
                await axios.post(`/api/leads/convert/${id}`);
                alert('🚀 Lead converted to Sale successfully!');
                fetchLeads();
            } catch (err) {
                alert('Conversion failed');
            }
        }
    };

    const deleteLead = async (id) => {
        if (window.confirm('Delete this lead?')) {
            try {
                await axios.delete(`/api/leads/${id}`);
                fetchLeads();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    const filteredLeads = leads.filter(l => {
        if (!searchQuery) return true;
        const low = searchQuery.toLowerCase();
        return (l.companyName?.toLowerCase().includes(low) || l.contactPerson?.toLowerCase().includes(low));
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'New': return 'bg-info';
            case 'Contacted': return 'bg-primary';
            case 'Interested': return 'bg-warning text-dark';
            case 'Proposal Sent': return 'bg-indigo text-white';
            case 'Closed Won': return 'bg-success';
            case 'Closed Lost': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    return (
        <section className="content-header">
            <div className="container-fluid">
                <div className="row mb-3 align-items-center">
                    <div className="col-sm-6">
                        <h1 className="fw-bold text-gradient">Lead Pipeline</h1>
                        <p className="text-muted small">Manage your pre-sales journey and conversions.</p>
                    </div>
                    <div className="col-sm-6 text-end">
                        <button className="btn btn-primary shadow-sm rounded-pill" onClick={openCreateModal}>
                            <i className="bi bi-plus-lg me-1"></i> New Lead
                        </button>
                    </div>
                </div>

                {/* KPI ROW */}
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 border-start border-primary border-4">
                            <div className="card-body py-3">
                                <h6 className="text-muted small text-uppercase fw-bold">Active Pipeline</h6>
                                <h3 className="fw-bold mb-0 text-primary">{leads.filter(l => l.status !== 'Closed Won' && l.status !== 'Closed Lost').length}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 border-start border-success border-4">
                            <div className="card-body py-3">
                                <h6 className="text-muted small text-uppercase fw-bold">Closed Won</h6>
                                <h3 className="fw-bold mb-0 text-success">{leads.filter(l => l.status === 'Closed Won').length}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 border-start border-warning border-4">
                            <div className="card-body py-3">
                                <h6 className="text-muted small text-uppercase fw-bold">Potential Revenue</h6>
                                <h3 className="fw-bold mb-0 text-warning">
                                    ${leads.reduce((acc, curr) => acc + (curr.status !== 'Closed Lost' ? Number(curr.estimatedValue || 0) : 0), 0).toLocaleString()}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LEADS TABLE */}
                <div className="card shadow-sm border-0 rounded-3">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">Company & Lead</th>
                                        <th>Status</th>
                                        <th>Source</th>
                                        <th>Value</th>
                                        <th>Next Follow-up</th>
                                        <th className="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLeads.map(lead => (
                                        <tr key={lead._id}>
                                            <td className="ps-4">
                                                <div className="fw-bold text-dark">{lead.companyName}</div>
                                                <div className="text-muted small">{lead.contactPerson} | {lead.city || 'No City'}</div>
                                            </td>
                                            <td>
                                                <span className={`badge ${getStatusBadge(lead.status)} rounded-pill px-3`}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td><span className="text-muted small">{lead.source}</span></td>
                                            <td>
                                                <div className="fw-bold text-dark">${(Number(lead.estimatedValue) || 0).toLocaleString()}</div>
                                            </td>
                                            <td>
                                                {lead.nextFollowUpDate ? (
                                                    <span className={new Date(lead.nextFollowUpDate) < new Date() ? 'text-danger fw-bold' : 'text-dark'}>
                                                        {new Date(lead.nextFollowUpDate).toLocaleDateString()}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="btn-group">
                                                    {lead.status !== 'Closed Won' && (
                                                        <button className="btn btn-sm btn-outline-success border-0" title="Convert to Sale" onClick={() => convertToSale(lead._id)}>
                                                            <i className="bi bi-rocket-takeoff-fill"></i>
                                                        </button>
                                                    )}
                                                    <button className="btn btn-sm btn-outline-primary border-0" onClick={() => openEditModal(lead)}>
                                                        <i className="bi bi-pencil-square"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger border-0" onClick={() => deleteLead(lead._id)}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredLeads.length === 0 && (
                                        <tr><td colSpan="6" className="text-center py-5 text-muted">No leads found. Start by adding one!</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-gradient-primary text-white">
                                <h5 className="modal-title fw-bold">{isEditing ? 'Update Lead Details' : 'Add New Potential Lead'}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Company Name</label>
                                            <input type="text" className="form-control" name="companyName" value={formData.companyName} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Contact Person</label>
                                            <input type="text" className="form-control" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold">Status</label>
                                            <select className="form-select" name="status" value={formData.status} onChange={handleInputChange}>
                                                {stages.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold">Source</label>
                                            <select className="form-select" name="source" value={formData.source} onChange={handleInputChange}>
                                                {sources.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold">Estimated Value ($)</label>
                                            <input type="number" className="form-control" name="estimatedValue" value={formData.estimatedValue} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Phone</label>
                                            <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Email</label>
                                            <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">City</label>
                                            <input type="text" className="form-control" name="city" value={formData.city} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Next Follow-up Date</label>
                                            <input type="date" className="form-control" name="nextFollowUpDate" value={formData.nextFollowUpDate} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-bold">Requirement Details</label>
                                            <textarea className="form-control" rows="2" name="requirement" value={formData.requirement} onChange={handleInputChange} placeholder="What is the customer looking for?"></textarea>
                                        </div>
                                        <div className="col-12 bg-light p-3 rounded">
                                            <label className="form-label small fw-bold text-primary">Log New Interaction (Timeline Note)</label>
                                            <textarea className="form-control" rows="2" value={note} onChange={e => setNote(e.target.value)} placeholder="E.g. Spoke to customer, they want a proposal by Friday..."></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light p-3">
                                    <button type="button" className="btn btn-link text-muted" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-4 rounded-pill">{isEditing ? 'Update Pipeline' : 'Add to Pipeline'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                .text-gradient {
                    background: linear-gradient(45deg, #2c3e50, #4ca1af);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .bg-indigo { background-color: #6610f2; }
                .bg-gradient-primary { background: linear-gradient(135deg, #4e73df 0%, #224abe 100%); }
            `}</style>
        </section>
    );
};

export default LeadsModule;

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';
import DepartmentDocuments from '../components/DepartmentDocuments';

const BillingModule = () => {
    const { user } = useContext(AuthContext);
    const { searchQuery } = useContext(SearchContext);
    const [sales, setSales] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [activeTab, setActiveTab] = useState('billing'); // billing, invoices
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [invoiceItems, setInvoiceItems] = useState([{ description: '', amount: 0 }]);
    const [pageView, setPageView] = useState('dashboard'); // 'dashboard' or 'print'
    const [printInvoice, setPrintInvoice] = useState(null);

    useEffect(() => {
        fetchData();
        fetchInvoices();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/sales');
            setSales(res.data);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const fetchInvoices = async () => {
        try {
            const res = await axios.get('/api/invoices');
            setInvoices(res.data);
        } catch (e) { console.error(e); }
    };

    // --- ACTIONS ---
    const handleGenerateClick = (sale) => {
        setSelectedSale(sale);
        setInvoiceItems([{
            description: `${sale.productName} (${sale.serviceLines || 'No details'})`,
            amount: sale.amount
        }]);
        setShowInvoiceModal(true);
    };

    const createInvoice = async () => {
        const total = invoiceItems.reduce((acc, item) => acc + Number(item.amount), 0);
        try {
            let saleIdToUse = selectedSale ? selectedSale._id : null;

            if (!saleIdToUse) {
                const custName = document.getElementById('newCustomerName')?.value;
                if (!custName) return alert('Customer Name Required');

                const saleRes = await axios.post('/api/sales', {
                    customerName: custName,
                    productName: 'Direct Invoice',
                    amount: total,
                    status: 'Billed',
                    agentName: user.name,
                    date: new Date()
                });
                saleIdToUse = saleRes.data._id;
            }

            await axios.post('/api/invoices', {
                saleId: saleIdToUse,
                items: invoiceItems,
                totalAmount: total,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            if (saleIdToUse) {
                await axios.put(`/api/sales/${saleIdToUse}`, { status: 'Billed' });
            }

            setShowInvoiceModal(false);
            fetchData();
            fetchInvoices();
            setActiveTab('invoices');
            alert('Invoice Generated Successfully');
        } catch (e) { alert('Failed to create invoice'); }
    };

    const markPaid = async (id) => {
        if (window.confirm('Mark this invoice as PAID?')) {
            try {
                await axios.put(`/api/invoices/${id}`, { status: 'Paid' });
                fetchData(); // Refresh sales status
                fetchInvoices();
            } catch (e) { alert('Error updating status'); }
        }
    };

    const deleteInvoice = async (id) => {
        if (window.confirm('Are you sure you want to DELETE this invoice? The order will go back to the Billing Queue.')) {
            try {
                await axios.delete(`/api/invoices/${id}`);
                fetchData();
                fetchInvoices();
            } catch (e) { alert('Error deleting invoice'); }
        }
    };

    const handlePrintView = (inv) => {
        setPrintInvoice(inv);
        setPageView('print');
    };

    // --- UI HELPERS ---
    const readyToBill = sales.filter(s => s.status === 'Executed' || (s.status === 'Pending Execution' && user.role === 'admin'));

    // --- PRINT VIEW ---
    if (pageView === 'print' && printInvoice) {
        return (
            <div className="container mt-5 bg-white p-5 border shadow-sm">
                <div className="row mb-4">
                    <div className="col-6">
                        <h2 className="text-primary fw-bold">INVOICE</h2>
                        <h5 className="text-muted">#{printInvoice.invoiceNumber}</h5>
                    </div>
                    <div className="col-6 text-end">
                        <h4 className="fw-bold">VIVA CRM Solutions</h4>
                        <p className="text-muted">Grand Tech Park<br />Bangalore, India<br />billing@viva.com</p>
                    </div>
                </div>
                <hr />
                <div className="row mb-5">
                    <div className="col-6">
                        <p className="mb-0 text-uppercase text-muted small fw-bold">Bill To</p>
                        <h5 className="fw-bold">{printInvoice.customerName}</h5>
                    </div>
                    <div className="col-6 text-end">
                        <p className="mb-0 text-uppercase text-muted small fw-bold">Details</p>
                        <p className="mb-0"><strong>Date:</strong> {new Date(printInvoice.date).toLocaleDateString()}</p>
                        <p><strong>Due Date:</strong> {printInvoice.dueDate ? new Date(printInvoice.dueDate).toLocaleDateString() : '-'}</p>
                    </div>
                </div>
                <table className="table table-bordered">
                    <thead className="table-light"><tr><th>Description</th><th className="text-end">Amount</th></tr></thead>
                    <tbody>
                        {printInvoice.items.map((item, i) => (
                            <tr key={i}>
                                <td>{item.description}</td>
                                <td className="text-end">${item.amount.toLocaleString()}</td>
                            </tr>
                        ))}
                        <tr>
                            <td className="text-end border-0 pt-4"><strong>Total</strong></td>
                            <td className="text-end border-0 pt-4"><strong className="fs-5 text-primary">${printInvoice.totalAmount.toLocaleString()}</strong></td>
                        </tr>
                    </tbody>
                </table>
                <div className="mt-5 text-center no-print">
                    <button className="btn btn-primary me-2 shadow-sm" onClick={() => window.print()}><i className="bi bi-printer me-2"></i>Print Invoice</button>
                    <button className="btn btn-secondary shadow-sm" onClick={() => setPageView('dashboard')}>Back to Dashboard</button>
                </div>
                <style>{`@media print { .no-print { display: none; } }`}</style>
            </div>
        );
    }

    // --- MAIN ---
    return (
        <section className="content-header">
            <div className="container-fluid">
                <div className="row mb-3">
                    <div className="col-md-6"><h1>Billing & Invoices</h1></div>
                </div>

                <div className="card card-primary card-outline card-outline-tabs shadow-sm">
                    <div className="card-header p-0 border-bottom-0">
                        <ul className="nav nav-tabs" id="custom-tabs-four-tab" role="tablist">
                            <li className="nav-item">
                                <a className={`nav-link ${activeTab === 'billing' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('billing')}>
                                    <i className="bi bi-receipt me-2"></i>Billing Queue <span className="badge bg-warning ms-1">{readyToBill.length}</span>
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className={`nav-link ${activeTab === 'invoices' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('invoices')}>
                                    <i className="bi bi-journal-text me-2"></i>Invoices
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className={`nav-link ${activeTab === 'docs' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('docs')}>
                                    <i className="bi bi-file-earmark-text me-2"></i>Documents
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="card-body p-0">
                        {/* QUEUE */}
                        {activeTab === 'billing' && (
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped table-hover table-sm text-nowrap align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                                    <thead className="table-light text-center">
                                        <tr>
                                            <th>Date</th>
                                            <th>Customer Name</th>
                                            <th>Product / Service</th>
                                            <th>Revenue</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {readyToBill.length === 0 ? (
                                            <tr><td colSpan="5" className="text-center py-4 text-muted">No pending billing items.</td></tr>
                                        ) : (
                                            readyToBill.filter(s => !searchQuery || s.customerName.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                                                <tr key={s._id}>
                                                    <td className="text-center">{new Date(s.date).toLocaleDateString()}</td>
                                                    <td className="fw-bold">{s.customerName}</td>
                                                    <td>{s.productName}</td>
                                                    <td className="text-end fw-bold text-success">${s.amount.toLocaleString()}</td>
                                                    <td className="text-center">
                                                        <button className="btn btn-sm btn-dark shadow-sm" onClick={() => handleGenerateClick(s)}>
                                                            <i className="bi bi-receipt me-1"></i> Inv
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* INVOICES */}
                        {activeTab === 'invoices' && (
                            <div className="table-responsive">
                                <div className="p-2 text-end bg-light border-bottom">
                                    <button className="btn btn-primary btn-sm shadow-sm" onClick={() => {
                                        setSelectedSale(null);
                                        setInvoiceItems([{ description: '', amount: 0 }]);
                                        setShowInvoiceModal(true);
                                    }}>
                                        <i className="bi bi-plus-lg me-1"></i> New Invoice
                                    </button>
                                </div>
                                <table className="table table-bordered table-striped table-hover table-sm text-nowrap align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                                    <thead className="table-light text-center">
                                        <tr>
                                            <th>Inv #</th>
                                            <th>Date</th>
                                            <th>Customer Name</th>
                                            <th>Status</th>
                                            <th>Payment Info</th>
                                            <th>Amount</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.length === 0 ? (
                                            <tr><td colSpan="6" className="text-center py-4 text-muted">No invoices generated yet.</td></tr>
                                        ) : (
                                            invoices.filter(i => !searchQuery || i.customerName.toLowerCase().includes(searchQuery.toLowerCase())).map(inv => (
                                                <tr key={inv._id}>
                                                    <td className="text-center fw-bold">{inv.invoiceNumber}</td>
                                                    <td className="text-center">{new Date(inv.date).toLocaleDateString()}</td>
                                                    <td>{inv.customerName}</td>
                                                    <td className="text-center">
                                                        <span className={`badge ${inv.status === 'Paid' ? 'bg-success' : 'bg-danger shadow-none'}`}>
                                                            {inv.status === 'Paid' ? 'PAID' : 'UNPAID'}
                                                        </span>
                                                    </td>
                                                    <td className="text-center small text-muted">
                                                        {inv.status === 'Paid' ? `Paid on ${new Date(inv.paymentDate).toLocaleDateString()}` : 'Payment Pending'}
                                                    </td>
                                                    <td className="text-end fw-bold">${inv.totalAmount.toLocaleString()}</td>
                                                    <td className="text-center">
                                                        <button className="btn btn-xs btn-info me-1 shadow-sm text-white" onClick={() => handlePrintView(inv)} title="Print/View"><i className="bi bi-printer"></i></button>
                                                        {inv.status !== 'Paid' && (
                                                            <button className="btn btn-xs btn-success me-1 shadow-sm" onClick={() => markPaid(inv._id)} title="Mark Paid"><i className="bi bi-check-lg"></i></button>
                                                        )}
                                                        <button className="btn btn-xs btn-outline-danger shadow-sm" onClick={() => deleteInvoice(inv._id)} title="Delete Invoice"><i className="bi bi-trash"></i></button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {/* DOCUMENTS */}
                        {activeTab === 'docs' && (
                            <div className="p-3">
                                <DepartmentDocuments department="finance" />
                            </div>
                        )}
                    </div>
                </div>

                {/* MODAL */}
                {showInvoiceModal && (
                    <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header bg-dark text-white">
                                    <h5 className="modal-title">{selectedSale ? 'Generate Invoice' : 'Create New Invoice'}</h5>
                                    <button className="btn-close btn-close-white" onClick={() => setShowInvoiceModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    {selectedSale ? (
                                        <div className="alert alert-info py-2">
                                            Generating invoice for <strong>{selectedSale.customerName}</strong>
                                        </div>
                                    ) : (
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Customer Name</label>
                                            <input className="form-control" placeholder="Enter Customer Name" id="newCustomerName" />
                                        </div>
                                    )}

                                    <h6 className="border-bottom pb-2 mt-3">Line Items</h6>
                                    {invoiceItems.map((item, idx) => (
                                        <div key={idx} className="row g-2 mb-2">
                                            <div className="col-8">
                                                <input className="form-control form-control-sm" placeholder="Description" value={item.description} onChange={e => {
                                                    const newItems = [...invoiceItems];
                                                    newItems[idx].description = e.target.value;
                                                    setInvoiceItems(newItems);
                                                }} />
                                            </div>
                                            <div className="col-4">
                                                <div className="input-group input-group-sm">
                                                    <span className="input-group-text">$</span>
                                                    <input type="number" className="form-control" placeholder="Amount" value={item.amount} onChange={e => {
                                                        const newItems = [...invoiceItems];
                                                        newItems[idx].amount = Number(e.target.value);
                                                        setInvoiceItems(newItems);
                                                    }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button className="btn btn-sm btn-link text-decoration-none p-0" onClick={() => setInvoiceItems([...invoiceItems, { description: '', amount: 0 }])}>
                                        <i className="bi bi-plus-circle me-1"></i>Add Item
                                    </button>

                                    <div className="mt-3 text-end bg-light p-2 rounded">
                                        <h5 className="mb-0">Total: <span className="text-primary">${invoiceItems.reduce((a, b) => a + Number(b.amount), 0).toLocaleString()}</span></h5>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light">
                                    <button className="btn btn-secondary btn-sm" onClick={() => setShowInvoiceModal(false)}>Cancel</button>
                                    <button className="btn btn-success btn-sm" onClick={createInvoice}>
                                        <i className="bi bi-check-lg me-1"></i>Create Invoice
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default BillingModule;

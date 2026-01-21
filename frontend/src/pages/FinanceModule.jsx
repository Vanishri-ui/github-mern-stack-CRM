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
    const [activeTab, setActiveTab] = useState('billing'); // billing, invoices, docs

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
        } catch (e) { console.error(e); }
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
        // Pre-fill item with sale product details
        setInvoiceItems([{
            description: `${sale.productName} (${sale.serviceLines || 'No details'})`,
            amount: sale.amount
        }]);
        setShowInvoiceModal(true);
    };

    const createInvoice = async () => {
        const total = invoiceItems.reduce((acc, item) => acc + Number(item.amount), 0);
        try {
            await axios.post('/api/invoices', {
                saleId: selectedSale._id,
                items: invoiceItems,
                totalAmount: total,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            });
            // Update Sale status to Billed
            await axios.put(`/api/sales/${selectedSale._id}`, { status: 'Billed' });

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
                fetchInvoices();
            } catch (e) { alert('Error updating status'); }
        }
    };

    const handlePrintView = (inv) => {
        setPrintInvoice(inv);
        setPageView('print');
    };

    // --- UI HELPERS ---
    const readyToBill = sales.filter(s => s.status === 'Executed' || (s.status === 'Pending Execution' && user.role === 'admin')); // Admin can bill pending if needed

    // --- PRINT VIEW ---
    if (pageView === 'print' && printInvoice) {
        return (
            <div className="container mt-5 bg-white p-5 border shadow-sm">
                <div className="row mb-4">
                    <div className="col-6">
                        <h2>INVOICE</h2>
                        <h5>#{printInvoice.invoiceNumber}</h5>
                    </div>
                    <div className="col-6 text-end">
                        <h4>My Company Name</h4>
                        <p>123 Business Rd.<br />Tech City, 560000</p>
                    </div>
                </div>
                <hr />
                <div className="row mb-4">
                    <div className="col-6">
                        <p><strong>Bill To:</strong><br />{printInvoice.customerName}</p>
                    </div>
                    <div className="col-6 text-end">
                        <p><strong>Date:</strong> {new Date(printInvoice.date).toLocaleDateString()}<br />
                            <strong>Due Date:</strong> {printInvoice.dueDate ? new Date(printInvoice.dueDate).toLocaleDateString() : '-'}</p>
                    </div>
                </div>
                <table className="table table-bordered">
                    <thead><tr><th>Description</th><th className="text-end">Amount</th></tr></thead>
                    <tbody>
                        {printInvoice.items.map((item, i) => (
                            <tr key={i}>
                                <td>{item.description}</td>
                                <td className="text-end">${item.amount.toLocaleString()}</td>
                            </tr>
                        ))}
                        <tr>
                            <td className="text-end"><strong>Total</strong></td>
                            <td className="text-end"><strong>${printInvoice.totalAmount.toLocaleString()}</strong></td>
                        </tr>
                    </tbody>
                </table>
                <div className="mt-5 text-center no-print">
                    <button className="btn btn-primary me-2" onClick={() => window.print()}>Print / Save PDF</button>
                    <button className="btn btn-secondary" onClick={() => setPageView('dashboard')}>Back</button>
                </div>
                {/* Print Styles */}
                <style>{`@media print { .no-print { display: none; } }`}</style>
            </div>
        );
    }

    // --- MAIN DASHBOARD VIEW ---
    return (
        <section className="content-header">
            <div className="container-fluid">
                <div className="row mb-3">
                    <div className="col-md-6"><h1>Finance & Billing</h1></div>
                </div>

                {/* TABS */}
                <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                        <a className={`nav-link ${activeTab === 'billing' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('billing')}>
                            Billing Queue <span className="badge bg-warning text-dark">{readyToBill.length}</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className={`nav-link ${activeTab === 'invoices' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('invoices')}>
                            Invoices
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className={`nav-link ${activeTab === 'docs' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('docs')}>
                            Documents
                        </a>
                    </li>
                </ul>

                {/* CONTENT */}
                <div className="text-end mb-2">
                    <button className="btn btn-primary" onClick={() => {
                        setSelectedSale(null); // Clear selected sale for new manual creation
                        setInvoiceItems([{ description: '', amount: 0 }]); // Reset items
                        setShowInvoiceModal(true);
                    }}>
                        <i className="bi bi-plus-lg"></i> Create New Invoice
                    </button>
                </div>

                {activeTab === 'billing' && (
                    <div className="card">
                        <div className="card-header bg-warning"><h3 className="card-title">Ready for Billing</h3></div>
                        <div className="card-body p-0">
                            <table className="table table-hover">
                                <thead><tr><th>Date</th><th>Customer</th><th>Product</th><th>Amount</th><th>Action</th></tr></thead>
                                <tbody>
                                    {readyToBill.length === 0 && <tr><td colSpan="5" className="text-center p-3">No orders pending billing.</td></tr>}
                                    {readyToBill.filter(s => !searchQuery || s.customerName.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                                        <tr key={s._id}>
                                            <td>{new Date(s.date).toLocaleDateString()}</td>
                                            <td>{s.customerName}</td>
                                            <td>{s.productName}</td>
                                            <td>${s.amount}</td>
                                            <td>
                                                <button className="btn btn-sm btn-dark" onClick={() => handleGenerateClick(s)}>Generate Invoice</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'invoices' && (
                    <div className="card">
                        <div className="card-header bg-success"><h3 className="card-title">All Invoices</h3></div>
                        <div className="card-body p-0">
                            <table className="table table-hover">
                                <thead><tr><th>Inv #</th><th>Date</th><th>Customer</th><th>Status</th><th>Amount</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {invoices.filter(i => !searchQuery || i.customerName.toLowerCase().includes(searchQuery.toLowerCase())).map(inv => (
                                        <tr key={inv._id}>
                                            <td>{inv.invoiceNumber}</td>
                                            <td>{new Date(inv.date).toLocaleDateString()}</td>
                                            <td>{inv.customerName}</td>
                                            <td>
                                                <span className={`badge bg-${inv.status === 'Paid' ? 'success' : 'danger'}`}>{inv.status}</span>
                                            </td>
                                            <td>${inv.totalAmount.toLocaleString()}</td>
                                            <td>
                                                <button className="btn btn-sm btn-info me-1" onClick={() => handlePrintView(inv)}><i className="bi bi-printer"></i></button>
                                                {inv.status !== 'Paid' && (
                                                    <button className="btn btn-sm btn-outline-success" onClick={() => markPaid(inv._id)}>Mark Paid</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'docs' && (
                    <DepartmentDocuments department="finance" />
                )}

                {/* INVOICE MODAL */}
                {showInvoiceModal && (
                    <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{selectedSale ? 'Generate Invoice' : 'Create New Invoice'}</h5>
                                    <button className="btn-close" onClick={() => setShowInvoiceModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    {selectedSale ? (
                                        <p><strong>Customer:</strong> {selectedSale.customerName}</p>
                                    ) : (
                                        <div className="mb-3">
                                            <label>Customer Name</label>
                                            <input className="form-control" placeholder="Enter Customer Name" id="newCustomerName" />
                                        </div>
                                    )}
                                    <hr />
                                    <h6>Line Items</h6>
                                    {invoiceItems.map((item, idx) => (
                                        <div key={idx} className="d-flex mb-2">
                                            <input className="form-control me-2" placeholder="Description" value={item.description} onChange={e => {
                                                const newItems = [...invoiceItems];
                                                newItems[idx].description = e.target.value;
                                                setInvoiceItems(newItems);
                                            }} />
                                            <input type="number" className="form-control" style={{ width: '100px' }} placeholder="Amt" value={item.amount} onChange={e => {
                                                const newItems = [...invoiceItems];
                                                newItems[idx].amount = Number(e.target.value);
                                                setInvoiceItems(newItems);
                                            }} />
                                        </div>
                                    ))}
                                    <button className="btn btn-sm btn-link" onClick={() => setInvoiceItems([...invoiceItems, { description: '', amount: 0 }])}>+ Add Item</button>

                                    <div className="mt-3 text-end">
                                        <h5>Total: ${invoiceItems.reduce((a, b) => a + Number(b.amount), 0)}</h5>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowInvoiceModal(false)}>Cancel</button>
                                    <button className="btn btn-success" onClick={async () => {
                                        // Custom Logic for Creating Invoice
                                        const total = invoiceItems.reduce((acc, item) => acc + Number(item.amount), 0);
                                        try {
                                            let saleIdToUse = selectedSale ? selectedSale._id : null;

                                            // If no sale selected, create a dummy sale first
                                            if (!saleIdToUse) {
                                                const custName = document.getElementById('newCustomerName').value;
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

                                            if (selectedSale) {
                                                await axios.put(`/api/sales/${selectedSale._id}`, { status: 'Billed' });
                                            }

                                            setShowInvoiceModal(false);
                                            fetchData();
                                            fetchInvoices();
                                            setActiveTab('invoices');
                                            alert('Invoice Generated Successfully');
                                        } catch (e) { console.error(e); alert('Failed'); }
                                    }}>Create Invoice</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FinanceModule;

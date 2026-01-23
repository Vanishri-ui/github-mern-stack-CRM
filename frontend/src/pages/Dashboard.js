import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    if (!user) return <div className="text-center p-5 text-muted">Loading Application...</div>;

    // --- DEPARTMENT CONFIG ---
    // Updated to reflect current module structure (No 'Ops')
    const departments = [
        {
            title: 'Sales & Orders',
            head: 'Mohammad Tabrez',
            icon: 'bi-graph-up-arrow',
            gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', // Premium Blue
            link: '/sales',
            desc: 'Pipeline management, order entry, and sales analytics.',
            stats: 'View Orders'
        },
        {
            title: 'Order Execution',
            head: 'Execution Lead',
            icon: 'bi-lightning-charge-fill',
            gradient: 'linear-gradient(135deg, #f09819 0%, #edde5d 100%)', // Premium Gold/Yellow
            textColor: 'text-dark',
            link: '/execution',
            desc: 'Work order generation, provisioning, and status tracking.',
            stats: 'Process Pending'
        },
        {
            title: 'Financial Revenue',
            head: 'Finance Lead',
            icon: 'bi-database-fill-check',
            gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', // Premium Green
            link: '/finance',
            desc: 'Revenue ledger, AM performance, and financial analytics.',
            stats: 'View Revenue'
        },
        {
            title: 'Billing & Invoicing',
            head: 'Gopinath',
            icon: 'bi-receipt-cutoff',
            gradient: 'linear-gradient(135deg, #3a7bd5 0%, #3a6073 100%)', // Sleek Blue
            link: '/billing',
            desc: 'Customer invoicing, billing queue, and payment status.',
            stats: 'Create Invoices'
        },
        {
            title: 'Support & Tickets',
            head: 'Subramaniyan & Suman',
            icon: 'bi-headset',
            gradient: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', // Premium Purple
            link: '/support',
            desc: 'Customer helpdesk, ticket resolution, and SLA monitoring.',
            stats: 'Resolve Tickets'
        }
    ];

    return (
        <section className="content-header p-4">
            <div className="container-fluid">

                {/* WELCOME HEADER */}
                <div className="row mb-5 align-items-center">
                    <div className="col-md-8">
                        <h1 className="fw-bold display-5 mb-1" style={{ letterSpacing: '-1px' }}>
                            Welcome back, <span className="text-primary">{user.name.split(' ')[0]}</span>
                        </h1>
                        <p className="lead text-muted">Here's what's happening in your workspace today.</p>
                    </div>
                    <div className="col-md-4 text-md-end">
                        <span className="badge bg-light text-dark border p-2 fw-normal fs-6 shadow-sm">
                            <i className="bi bi-calendar3 me-2"></i>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* DEPARTMENT CARDS */}
                <div className="row g-4">
                    {departments.map((dept, idx) => (
                        <div key={idx} className="col-xl-3 col-md-6 col-sm-12">
                            <div
                                className="card h-100 border-0 shadow-sm overflow-hidden dept-card"
                                onClick={() => navigate(dept.link)}
                                style={{ cursor: 'pointer', transition: 'all 0.3s ease', borderRadius: '15px' }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                    e.currentTarget.style.boxShadow = '0 1rem 3rem rgba(0,0,0,.175)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)';
                                }}
                            >
                                <div className="card-body position-relative p-4" style={{ background: dept.gradient, color: dept.textColor || 'white' }}>
                                    {/* Icon Background Decoration */}
                                    <div style={{ position: 'absolute', right: '-20px', top: '-20px', fontSize: '8rem', opacity: '0.15', transform: 'rotate(15deg)' }}>
                                        <i className={`bi ${dept.icon}`}></i>
                                    </div>

                                    <div className="mb-4">
                                        <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm"
                                            style={{ width: '50px', height: '50px', backgroundColor: 'rgba(255,255,255,0.2)' }}>
                                            <i className={`bi ${dept.icon} fs-4`}></i>
                                        </div>
                                        <h3 className="fw-bold mb-1">{dept.title}</h3>
                                        <small className="opacity-75 text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
                                            Head: {dept.head}
                                        </small>
                                    </div>

                                    <p className="card-text mb-4 opacity-75" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                                        {dept.desc}
                                    </p>

                                    <div className="d-flex align-items-center justify-content-between">
                                        <button className={`btn btn-sm ${dept.textColor ? 'btn-light' : 'btn-outline-light'} px-3 rounded-pill fw-bold`}>
                                            {dept.stats} <i className="bi bi-arrow-right ms-1"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* QUICK ACTIONS / ALERTS (Optional placeholder for future expansion) */}
                <div className="row mt-5">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '15px', background: 'linear-gradient(to right, #f8f9fa, #ffffff)' }}>
                            <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap">
                                <div>
                                    <h5 className="fw-bold mb-1"><i className="bi bi-info-circle-fill text-primary me-2"></i>System Status</h5>
                                    <p className="text-muted mb-0 small">All systems operational. Last backup: Today 04:00 AM.</p>
                                </div>
                                <div className="mt-2 mt-md-0">
                                    <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => navigate('/documents?dept=all')}>
                                        <i className="bi bi-files me-1"></i> Document Repository
                                    </button>
                                    {(user.role === 'admin') &&
                                        <button className="btn btn-outline-dark btn-sm" onClick={() => navigate('/roles')}>
                                            <i className="bi bi-people me-1"></i> Manage Teams
                                        </button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Dashboard;

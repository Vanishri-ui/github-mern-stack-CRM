import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    if (!user) return <div style={{ color: 'white' }}>Loading...</div>;

    // --- DEPARTMENT CARDS CONFIG ---
    const departments = [
        {
            title: 'Sales Department',
            head: 'Mohammad Tabrez',
            icon: 'bi-graph-up-arrow',
            color: 'bg-success',
            link: '/sales',
            desc: 'Manage pipelines, orders, and revenue.'
        },
        {
            title: 'Finance & Billing',
            head: 'Gopinath',
            icon: 'bi-wallet2',
            color: 'bg-purple', // Custom class or use inline style
            style: { backgroundColor: '#6f42c1', color: 'white' },
            link: '/finance',
            desc: 'Invoicing, payments, and expenses.'
        },
        {
            title: 'Support & Tech',
            head: 'Subramaniyan & Suman',
            icon: 'bi-headset',
            color: 'bg-primary',
            link: '/support',
            desc: 'Ticket resolution and customer queries.'
        },
        {
            title: 'Operations',
            head: 'Ops Team',
            icon: 'bi-gear-wide-connected',
            color: 'bg-warning',
            link: '/ops',
            desc: 'Monitor Order Status (Read Only).'
        },
        {
            title: 'Execution Team',
            head: 'Execution Lead',
            icon: 'bi-lightning-charge',
            color: 'bg-danger',
            link: '/execution',
            desc: 'Create & Execute Work Orders.'
        }
    ];

    return (
        <section className="content-header">
            <div className="container-fluid">
                <div className="text-center mb-5 mt-3">
                    <h1 className="display-4 fw-bold">Welcome, {user.name}</h1>
                    <p className="lead text-muted">Select a department to manage</p>
                </div>

                <div className="row justify-content-center">
                    {departments.map((dept, idx) => (
                        <div key={idx} className="col-lg-3 col-md-6 mb-4">
                            <div className="card h-100 shadow-sm border-0 hover-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                                onClick={() => navigate(dept.link)}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>

                                <div className={`card-header text-center py-4 ${dept.color}`} style={dept.style}>
                                    <i className={`bi ${dept.icon} display-3`}></i>
                                </div>
                                <div className="card-body text-center">
                                    <h4 className="card-title w-100 fw-bold mb-3">{dept.title}</h4>
                                    <p className="card-text text-muted">{dept.desc}</p>
                                    <hr />
                                    <small className="text-uppercase fw-bold text-muted" style={{ fontSize: '0.75rem' }}>Department Head</small>
                                    <div className="mt-1 fw-bold text-dark">{dept.head}</div>
                                </div>
                                <div className="card-footer bg-white border-0 text-center pb-4">
                                    <button className="btn btn-outline-dark btn-sm rounded-pill px-4">Open Dashboard</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Info / Recent Activity could go here */}

            </div>
        </section>
    );
};

export default Dashboard;

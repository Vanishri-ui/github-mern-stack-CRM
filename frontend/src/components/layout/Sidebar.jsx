import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    // Dynamic Brand Name
    const getBrandName = () => {
        if (!user) return 'VIVA CRM';
        if (user.role === 'admin') return 'VIVA Admin';
        switch (user.department) {
            case 'sales': return 'VIVA Sales';
            case 'tech': return 'VIVA Support';
            case 'finance': return 'VIVA Finance';
            case 'execution': return 'VIVA Execution';
            default: return 'VIVA CRM';
        }
    };

    const navItems = [
        { label: 'Dashboard', path: '/dashboard', icon: 'bi-speedometer2', roles: ['admin', 'sales', 'execution', 'finance', 'tech'] }, // All roles can see dashboard
        { label: 'Sales', path: '/sales', icon: 'bi-currency-dollar', roles: ['admin', 'sales'] },
        { label: 'Execution', path: '/execution', icon: 'bi-play-circle-fill', roles: ['admin', 'execution'] },
        { label: 'Financial Revenue', path: '/finance', icon: 'bi-database-fill-check', roles: ['admin', 'finance'] },
        { label: 'Billing & Invoicing', path: '/billing', icon: 'bi-receipt-cutoff', roles: ['admin', 'billing', 'finance'] },
        { label: 'Support', path: '/support', icon: 'bi-headset', roles: ['admin', 'tech'] },
    ];

    return (
        <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
            <div className="sidebar-brand">
                <Link to="/dashboard" className="brand-link">
                    <span className="brand-text fw-light text-uppercase tracking-wider">{getBrandName()}</span>
                </Link>
            </div>
            <div className="sidebar-user p-3 border-bottom border-secondary">
                <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                        <i className="bi bi-person-circle fs-3 text-light"></i>
                    </div>
                    <div className="flex-grow-1 ms-3">
                        <h6 className="mb-0 text-white small fw-bold">{user?.name}</h6>
                        <small className="text-secondary d-block" style={{ fontSize: '0.7rem' }}>
                            {user?.title || user?.role?.toUpperCase()}
                        </small>
                    </div>
                </div>
                {user?.permissions && user.permissions.length > 0 && (
                    <div className="mt-2 d-flex flex-wrap gap-1">
                        {user.permissions.map(p => (
                            <span key={p} className="badge bg-secondary" style={{ fontSize: '0.6rem' }}>{p}</span>
                        ))}
                    </div>
                )}
            </div>
            <div className="sidebar-wrapper">
                <nav className="mt-2">
                    <ul className="nav sidebar-menu flex-column" role="menu">
                        {navItems.filter(item => !item.roles || item.roles.includes(user?.role)).map((item, idx) => (
                            <li key={idx} className="nav-item">
                                <Link to={item.path} className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}>
                                    <i className={`nav-icon bi ${item.icon}`}></i>
                                    <p>{item.label}</p>
                                </Link>
                            </li>
                        ))}

                        {/* ADMINISTRATION SECTION */}
                        {(user?.role === 'admin' || user?.isDepartmentHead || user?.isSalesManager) && (
                            <>
                                <li className="nav-header">ADMINISTRATION</li>
                                <li className="nav-item">
                                    <Link to="/roles" className={`nav-link ${location.pathname === '/roles' ? 'active' : ''}`}>
                                        <i className="nav-icon bi bi-people"></i>
                                        <p>Roles & Team</p>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/documents" className={`nav-link ${location.pathname === '/documents' ? 'active' : ''}`}>
                                        <i className="nav-icon bi bi-file-earmark-text"></i>
                                        <p>Global Documents</p>
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;

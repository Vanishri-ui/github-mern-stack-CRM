import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    return (
        <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
            <div className="sidebar-brand">
                <Link to="/dashboard" className="brand-link">
                    <span className="brand-text fw-light">VIVA Admin</span>
                </Link>
            </div>
            <div className="sidebar-wrapper">
                <nav className="mt-2">
                    <ul className="nav sidebar-menu flex-column" data-lte-toggle="treeview" role="menu" data-accordion="false">
                        {/* Admin sees Dashboard */}
                        {user && user.role === 'admin' && (
                            <li className="nav-item">
                                <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                                    <i className="nav-icon bi bi-speedometer"></i>
                                    <p>Dashboard</p>
                                </Link>
                            </li>
                        )}

                        <li className="nav-header">MODULES</li>

                        {/* Documents Link: All Users */}
                        <li className="nav-item">
                            <Link to="/documents" className={`nav-link ${location.pathname === '/documents' ? 'active' : ''}`}>
                                <i className="nav-icon bi bi-folder2-open"></i>
                                <p>Documents</p>
                            </Link>
                        </li>

                        {/* Sales Link: Admin & Sales */}
                        {user && (user.role === 'admin' || user.role === 'sales') && (
                            <li className="nav-item">
                                <Link to="/sales" className={`nav-link ${location.pathname === '/sales' ? 'active' : ''}`}>
                                    <i className="nav-icon bi bi-currency-dollar"></i>
                                    <p>Sales Order</p>
                                </Link>
                            </li>
                        )}

                        {/* Ops Link: Admin & Ops */}
                        {user && (user.role === 'admin' || user.role === 'ops') && (
                            <li className="nav-item">
                                <Link to="/ops" className={`nav-link ${location.pathname === '/ops' ? 'active' : ''}`}>
                                    <i className="nav-icon bi bi-gear-wide-connected"></i>
                                    <p>Order Execution</p>
                                </Link>
                            </li>
                        )}

                        {/* Support Link: Admin & Tech */}
                        {user && (user.role === 'admin' || user.role === 'tech') && (
                            <li className="nav-item">
                                <Link to="/support" className={`nav-link ${location.pathname === '/support' ? 'active' : ''}`}>
                                    <i className="nav-icon bi bi-ticket-detailed"></i>
                                    <p>Support</p>
                                </Link>
                            </li>
                        )}

                        {/* Finance Link: Admin & Finance */}
                        {user && (user.role === 'admin' || user.role === 'finance') && (
                            <li className="nav-item">
                                <Link to="/finance" className={`nav-link ${location.pathname === '/finance' ? 'active' : ''}`}>
                                    <i className="nav-icon bi bi-cash-coin"></i>
                                    <p>Finance & Billing</p>
                                </Link>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;

import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SearchContext } from '../../context/SearchContext';
import { Link } from 'react-router-dom';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const { searchQuery, setSearchQuery } = useContext(SearchContext);

    return (
        <nav className="app-header navbar navbar-expand bg-body">
            <div className="container-fluid">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className="nav-link" data-lte-toggle="sidebar" href="#" role="button">
                            <i className="bi bi-list"></i>
                        </a>
                    </li>
                    <li className="nav-item d-none d-md-block">
                        <Link to="/dashboard" className="nav-link">Home</Link>
                    </li>
                </ul>

                {/* SEARCH FORM */}
                <form className="d-flex ms-3 w-50" onSubmit={(e) => e.preventDefault()}>
                    <div className="input-group">
                        <input
                            className="form-control"
                            type="search"
                            placeholder="Search files, folders, or modules..."
                            aria-label="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="btn btn-outline-secondary" type="submit">
                            <i className="bi bi-search"></i>
                        </button>
                    </div>
                </form>

                <ul className="navbar-nav ms-auto">
                    <li className="nav-item dropdown user-menu">
                        <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                            <i className="bi bi-person-circle img-circle elevation-2"></i>
                            <span className="d-none d-md-inline ms-2">{user ? user.name : 'User'}</span>
                        </a>
                        <ul className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
                            <li className="user-header text-bg-primary">
                                <i className="bi bi-person-circle fs-1"></i>
                                <p>
                                    {user ? user.name : 'User'}
                                    <small>{user ? `${user.role} - ${user.department}` : ''}</small>
                                </p>
                            </li>
                            <li className="user-footer">
                                <button onClick={logout} className="btn btn-default btn-flat float-end">Sign out</button>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Header;

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const RolesPage = () => {
    const { user: currentUser } = useContext(AuthContext); // Rename to avoid conflict if needed
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null); // For modal

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/users');
            setUsers(res.data);
            setLoading(false);
        } catch (e) { console.error(e); setLoading(false); }
    };

    const departments = ['sales', 'tech', 'finance', 'execution', 'admin', 'hr'];

    const getDeptColor = (dept) => {
        switch (dept) {
            case 'sales': return 'success';
            case 'tech': return 'primary';
            case 'finance': return 'purple';
            case 'execution': return 'info';
            case 'hr': return 'danger';
            case 'admin': return 'dark';
            default: return 'secondary';
        }
    };

    const getPermIcon = (perm) => {
        switch (perm) {
            case 'CREATE': return <i className="bi bi-plus-circle-fill text-success" title="Create"></i>;
            case 'READ': return <i className="bi bi-eye-fill text-info" title="Read"></i>;
            case 'UPDATE': return <i className="bi bi-pencil-fill text-warning" title="Update"></i>;
            case 'DELETE': return <i className="bi bi-trash-fill text-danger" title="Delete"></i>;
            default: return <span className="badge bg-secondary">{perm}</span>;
        }
    };

    const handleUserClick = (u) => {
        // "Touched the name" interaction
        setSelectedUser(u);
    };

    if (loading) return <div className="p-5 text-center">Loading Roles...</div>;

    return (
        <section className="content-header">
            <div className="container-fluid">
                <div className="row mb-4">
                    <div className="col-12">
                        <h1 className="fw-bold text-dark mb-0">Staff Roles & Permissions</h1>
                        <p className="text-muted">Dynamic organizational hierarchy. Click a user to view details.</p>
                    </div>
                </div>

                <div className="row">
                    {departments.map(dept => {
                        const deptUsers = users.filter(u => u.department === dept);
                        if (deptUsers.length === 0) return null;

                        return (
                            <div className="col-md-4 mb-4" key={dept}>
                                <div className={`card card-${getDeptColor(dept)} card-outline shadow-sm h-100`}>
                                    <div className="card-header">
                                        <h3 className="card-title fw-bold text-uppercase small">{dept} Department</h3>
                                    </div>
                                    <div className="card-body p-0">
                                        <ul className="list-group list-group-flush">
                                            {deptUsers.map(u => (
                                                <li
                                                    className="list-group-item py-3 list-group-item-action"
                                                    key={u._id}
                                                    onClick={() => handleUserClick(u)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="d-flex align-items-center">
                                                        <div className="flex-shrink-0">
                                                            <i className={`bi bi-person-circle fs-4 text-${getDeptColor(dept)}`}></i>
                                                        </div>
                                                        <div className="flex-grow-1 ms-3">
                                                            <div className="fw-bold text-primary">{u.name}</div>
                                                            <div className="text-muted small mb-1">
                                                                <span className="badge bg-light text-dark border me-1">{u.title || u.role}</span>
                                                            </div>
                                                            <div className="d-flex flex-wrap gap-2 mt-2">
                                                                {u.permissions?.map(p => (
                                                                    <span key={p} className="fs-6 me-1">{getPermIcon(p)}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="ms-auto text-muted">
                                                            <i className="bi bi-chevron-right"></i>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* USER DETAIL MODAL */}
            {selectedUser && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Staff Details</h5>
                                <button className="btn-close" onClick={() => setSelectedUser(null)}></button>
                            </div>
                            <div className="modal-body text-center p-4">
                                <div className="mb-3">
                                    <div className="d-inline-block rounded-circle bg-light p-3 mb-2 shadow-sm">
                                        <i className={`bi bi-person-fill fs-1 text-${getDeptColor(selectedUser.department)}`}></i>
                                    </div>
                                </div>
                                <h3 className="fw-bold">{selectedUser.name}</h3>
                                <p className="text-muted">{selectedUser.title || selectedUser.role.toUpperCase()}</p>
                                <span className={`badge bg-${getDeptColor(selectedUser.department)} mb-4`}>{selectedUser.department.toUpperCase()}</span>

                                <div className="text-start border-top pt-3">
                                    <h6 className="fw-bold mb-3">System Permissions</h6>
                                    <div className="d-flex justify-content-center gap-4">
                                        {selectedUser.permissions?.map(p => (
                                            <div key={p} className="text-center">
                                                <div className="fs-3">{getPermIcon(p)}</div>
                                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>{p}</small>
                                            </div>
                                        ))}
                                        {(!selectedUser.permissions || selectedUser.permissions.length === 0) && <p className="text-muted small">No specific permissions assigned.</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer justify-content-center bg-light">
                                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedUser(null)}>Close</button>
                                {/* Future: Add Edit Button here if RBAC allows */}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .card-purple { border-top: 3px solid #6f42c1; }
                .text-purple { color: #6f42c1; }
                .bg-purple { background-color: #6f42c1 !important; color: white; }
            `}</style>
        </section>
    );
};

export default RolesPage;

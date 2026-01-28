import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RolesPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="p-5 text-center">Loading Roles...</div>;

    return (
        <section className="content-header">
            <div className="container-fluid">
                <div className="row mb-4">
                    <div className="col-12">
                        <h1 className="fw-bold text-dark mb-0">Staff Roles & Permissions</h1>
                        <p className="text-muted">Dynamic organizational hierarchy based on system access levels.</p>
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
                                                <li className="list-group-item py-3" key={u._id}>
                                                    <div className="d-flex align-items-center">
                                                        <div className="flex-shrink-0">
                                                            <i className={`bi bi-person-circle fs-4 text-${getDeptColor(dept)}`}></i>
                                                        </div>
                                                        <div className="flex-grow-1 ms-3">
                                                            <div className="fw-bold">{u.name}</div>
                                                            <div className="text-muted small mb-1">
                                                                <span className="badge bg-light text-dark border me-1">{u.title || u.role}</span>
                                                            </div>
                                                            <div className="d-flex flex-wrap gap-1">
                                                                {u.permissions?.map(p => (
                                                                    <span key={p} className="badge bg-secondary" style={{ fontSize: '0.6rem' }}>{p}</span>
                                                                ))}
                                                            </div>
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
            <style>{`
                .card-purple { border-top: 3px solid #6f42c1; }
                .text-purple { color: #6f42c1; }
            `}</style>
        </section>
    );
};

export default RolesPage;

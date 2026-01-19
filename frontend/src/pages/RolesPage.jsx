import React from 'react';

const RolesPage = () => {
    // Hardcoded structure for visualization based on seed data
    // In a real app, this could be fetched dynamically if the user model had 'reportsTo' fields.
    // For this requirement, we visualize the structure we seeded.

    return (
        <section className="content-header">
            <div className="container-fluid">
                <h1 className="fw-light text-dark mb-4">Organizational Hierarchy & Roles</h1>

                <div className="row">
                    {/* FINANCE DEPT */}
                    <div className="col-md-4">
                        <div className="card card-purple card-outline shadow">
                            <div className="card-header"><h3 className="card-title fw-bold">Finance Department</h3></div>
                            <div className="card-body">
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item bg-light">
                                        <i className="bi bi-crown text-warning me-2"></i>
                                        <strong>Gopinath</strong> <br />
                                        <small className="text-muted ms-4">Head of Billing & Finance</small>
                                    </li>
                                    <li className="list-group-item ms-4 border-start border-3 border-purple">
                                        <i className="bi bi-person-badge text-purple me-2"></i>
                                        <strong>Shailaja</strong> <br />
                                        <small className="text-muted ms-4">Finance Manager</small>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* SALES DEPT */}
                    <div className="col-md-4">
                        <div className="card card-success card-outline shadow">
                            <div className="card-header"><h3 className="card-title fw-bold">Sales Department</h3></div>
                            <div className="card-body">
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item bg-light">
                                        <i className="bi bi-crown text-warning me-2"></i>
                                        <strong>Mohammad Tabrez</strong> <br />
                                        <small className="text-muted ms-4">Head of Sales</small>
                                    </li>
                                    <li className="list-group-item ms-4 border-start border-3 border-success">
                                        <i className="bi bi-people text-success me-2"></i>
                                        <strong>Sales Team</strong> <br />
                                        <small className="text-muted ms-4">Sales Person 1, 2, 3...</small>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* SUPPORT DEPT */}
                    <div className="col-md-4">
                        <div className="card card-primary card-outline shadow">
                            <div className="card-header"><h3 className="card-title fw-bold">Support / Tech</h3></div>
                            <div className="card-body">
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item">
                                        <i className="bi bi-person-circle text-primary me-2"></i>
                                        <strong>Subramaniyan</strong> <br />
                                        <small className="text-muted ms-4">Support Manager</small>
                                    </li>
                                    <li className="list-group-item">
                                        <i className="bi bi-person-circle text-primary me-2"></i>
                                        <strong>Suman</strong> <br />
                                        <small className="text-muted ms-4">Support Manager</small>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default RolesPage;

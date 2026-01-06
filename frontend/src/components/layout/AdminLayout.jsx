import React, { useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {

    // Fix for body class names required by AdminLTE
    useEffect(() => {
        document.body.className = "layout-fixed sidebar-expand-lg bg-body-tertiary";
        return () => {
            document.body.className = ""; // Cleanup
        }
    }, []);

    return (
        <div className="app-wrapper">
            <Header />
            <Sidebar />
            <main className="app-main">
                <div className="app-content-header">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-6">
                                <h3 className="mb-0">Dashboard</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="app-content">
                    <div className="container-fluid">
                        <Outlet />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AdminLayout;

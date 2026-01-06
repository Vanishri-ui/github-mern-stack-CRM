import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SearchContext } from '../context/SearchContext';

const DocumentsPage = () => {
    const { user } = useContext(AuthContext);
    const { searchQuery } = useContext(SearchContext);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Upload State
    const [file, setFile] = useState(null);
    const [docTitle, setDocTitle] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await axios.get('/api/documents');
            setDocuments(res.data);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const handleDocUpload = async (e) => {
        e.preventDefault();
        if (!file || !docTitle) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', docTitle);

        setIsUploading(true);
        try {
            await axios.post('/api/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFile(null);
            setDocTitle('');
            setShowModal(false);
            fetchDocuments();
        } catch (e) {
            alert('Failed to upload document');
        }
        setIsUploading(false);
    };

    return (
        <section className="content-header">
            <div className="container-fluid">
                <div className="row mb-2">
                    <div className="col-sm-6">
                        <h1 className="fw-light text-dark">Department Documents</h1>
                    </div>
                    <div className="col-sm-6">
                        <button className="btn btn-primary btn-sm float-sm-end shadow-sm" onClick={() => setShowModal(true)}>
                            <i className="bi bi-upload me-1"></i> Upload Document
                        </button>
                    </div>
                </div>

                <div className="card card-outline card-primary shadow-sm">
                    <div className="card-header">
                        <h3 className="card-title fw-normal">Document List</h3>
                        <div className="card-tools">
                            {/* Uses Global Search */}
                        </div>
                    </div>
                    <div className="card-body p-0">
                        {loading ? <div className="p-3">Loading...</div> : (
                            <table className="table table-hover table-striped">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Uploaded By</th>
                                        <th>Department</th>
                                        <th>Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.filter(doc => {
                                        if (!searchQuery) return true;
                                        return doc.title?.toLowerCase().includes(searchQuery.toLowerCase());
                                    }).length === 0 ? (
                                        <tr><td colSpan="5" className="text-center">No documents found.</td></tr>
                                    ) : (
                                        documents.filter(doc => {
                                            if (!searchQuery) return true;
                                            return doc.title?.toLowerCase().includes(searchQuery.toLowerCase());
                                        }).map(doc => (
                                            <tr key={doc._id}>
                                                <td>
                                                    <i className="bi bi-file-earmark-text me-2 text-primary"></i>
                                                    {doc.title}
                                                </td>
                                                <td>{doc.uploadedBy?.name || 'Unknown'}</td>
                                                <td><span className="badge bg-secondary">{doc.department}</span></td>
                                                <td>{new Date(doc.uploadDate).toLocaleDateString()}</td>
                                                <td>
                                                    <a href={`/uploads/${doc.filename}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                                                        <i className="bi bi-download"></i> Download
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* UPLOAD MODAL */}
                {showModal && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Upload New Document</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <form onSubmit={handleDocUpload}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">Document Title <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" value={docTitle} onChange={e => setDocTitle(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Select File <span className="text-danger">*</span></label>
                                            <input type="file" className="form-control" onChange={e => setFile(e.target.files[0])} required />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary" disabled={isUploading}>
                                            {isUploading ? 'Uploading...' : 'Upload'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </section>
    );
};

export default DocumentsPage;

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const DepartmentDocuments = ({ department }) => {
    const { user } = useContext(AuthContext);
    const [docs, setDocs] = useState([]);
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocuments();
    }, [department]); // Re-fetch if department prop changes

    const fetchDocuments = async () => {
        try {
            const res = await axios.get('/api/documents');
            // Filter client-side for now, or update backend to accept query param
            // Assuming backend sends all, we filter here:
            const filtered = res.data.filter(d => d.department === department);
            setDocs(filtered);
            setLoading(false);
        } catch (e) { console.error(e); setLoading(false); }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        const formData = new FormData();
        formData.append('document', file);
        formData.append('title', file.name); // Automatically use filename as title
        formData.append('department', department);

        try {
            await axios.post('/api/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFile(null);
            fetchDocuments();
            alert('Document uploaded successfully');
        } catch (e) { alert('Upload failed'); }
    };

    return (
        <div className="card card-outline card-secondary">
            <div className="card-header">
                <h3 className="card-title text-capitalize">{department} Documents</h3>
            </div>
            <div className="card-body">
                {/* UPLOAD FORM */}
                <form onSubmit={handleUpload} className="mb-4">
                    <div className="input-group">
                        <input type="file" className="form-control" id="docUpload" onChange={e => setFile(e.target.files[0])} required />
                        <button className="btn btn-secondary" type="submit">
                            <i className="bi bi-upload me-1"></i> Upload
                        </button>
                    </div>
                    <small className="text-muted">Files will be tagged as <b>{department}</b>.</small>
                </form>

                {/* LIST */}
                <div className="list-group">
                    {loading && <div className="text-center p-3">Loading...</div>}
                    {!loading && docs.length === 0 && <div className="text-center p-3 text-muted">No documents found.</div>}
                    {docs.map(d => (
                        <a key={d._id} href={`http://localhost:5000/uploads/${d.filename}`} target="_blank" rel="noopener noreferrer" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                            <span><i className="bi bi-file-earmark-pdf me-2 text-danger"></i> Document</span>
                            <span className="badge bg-primary rounded-pill"><i className="bi bi-eye"></i> View</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DepartmentDocuments;

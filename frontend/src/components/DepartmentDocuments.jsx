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
        const formData = new FormData();
        formData.append('document', file);
        formData.append('title', title);
        formData.append('department', department); // Automatically tag with prop department

        try {
            await axios.post('/api/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setTitle(''); setFile(null);
            fetchDocuments();
            alert('Document uploaded successfully');
        } catch (e) { alert('Upload failed'); }
    };

    return (
        <div className="card card-outline card-secondary">
            <div className="card-header">
                <h3 className="card-title text-capitalize">{department} Documents</h3>
                <div className="card-tools"><button type="button" className="btn btn-tool" data-lte-toggle="card-collapse"><i className="bi bi-dash"></i></button></div>
            </div>
            <div className="card-body">
                {/* UPLOAD FORM */}
                <form onSubmit={handleUpload} className="mb-4">
                    <div className="input-group">
                        <input type="text" className="form-control" placeholder="Document Title" value={title} onChange={e => setTitle(e.target.value)} required />
                        <input type="file" className="form-control" onChange={e => setFile(e.target.files[0])} required />
                        <button className="btn btn-secondary" type="submit">Upload</button>
                    </div>
                    <small className="text-muted">Files will be tagged as <b>{department}</b>.</small>
                </form>

                {/* LIST */}
                <table className="table table-sm table-striped">
                    <thead><tr><th>Title</th><th>Filename</th><th>Uploaded By</th><th>Date</th><th>Action</th></tr></thead>
                    <tbody>
                        {loading && <tr><td colSpan="5">Loading...</td></tr>}
                        {!loading && docs.length === 0 && <tr><td colSpan="5">No documents found.</td></tr>}
                        {docs.map(d => (
                            <tr key={d._id}>
                                <td>{d.title}</td>
                                <td>{d.filename}</td>
                                <td>{d.uploadedBy ? d.uploadedBy.name : 'Unknown'}</td>
                                <td>{new Date(d.uploadDate).toLocaleDateString()}</td>
                                <td>
                                    <a href={`http://localhost:5000/uploads/${d.filename}`} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-info">
                                        <i className="bi bi-eye"></i> View
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DepartmentDocuments;

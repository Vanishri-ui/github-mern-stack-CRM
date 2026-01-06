import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    // Register fields
    const [name, setName] = useState('');
    const [department, setDepartment] = useState('sales');

    const { login, register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        let res;

        if (isRegister) {
            // Map Department to Role
            let role = 'sales'; // default
            if (department === 'admin') role = 'admin';
            if (department === 'ops') role = 'ops';
            if (department === 'finance') role = 'finance';
            if (department === 'tech') role = 'tech';
            if (department === 'hr') role = 'hr';

            res = await register({ name, email, password, department, role });
        } else {
            res = await login(email, password);
        }

        if (res.success) {
            const role = res.user.role;
            if (role === 'admin') navigate('/dashboard');
            else if (role === 'sales') navigate('/sales');
            else if (role === 'ops') navigate('/ops');
            else if (role === 'finance') navigate('/finance');
            else if (role === 'tech') navigate('/support');
            else navigate('/dashboard'); // Fallback
        } else {
            setError(res.msg);
        }
    };

    // Add login-page class to body on mount
    React.useEffect(() => {
        document.body.className = "login-page bg-body-secondary";
        return () => { document.body.className = ""; }
    }, []);

    return (
        <div className="login-box">
            <div className="login-logo">
                <a href="#" style={{ textDecoration: 'none' }}>
                    <img src="/img/logo.png?v=5" alt="VIVA Digitally" style={{ maxWidth: '200px' }} />
                </a>
            </div>

            <div className="card">
                <div className="card-body login-card-body">
                    <p className="login-box-msg">{isRegister ? 'Register a new membership' : 'Sign in to start your session'}</p>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {isRegister && (
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
                                <div className="input-group-text"><span className="bi bi-person"></span></div>
                            </div>
                        )}

                        <div className="input-group mb-3">
                            <input type="email" className="form-control" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <div className="input-group-text"><span className="bi bi-envelope"></span></div>
                        </div>

                        <div className="input-group mb-3">
                            <input type="password" className="form-control" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <div className="input-group-text"><span className="bi bi-lock-fill"></span></div>
                        </div>

                        {isRegister && (
                            <div className="input-group mb-3">
                                <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                                    <option value="admin">Admin (System Owner)</option>
                                    <option value="sales">Sales</option>
                                    <option value="ops">Operations (Order Execution)</option>
                                    <option value="finance">Finance (Billing)</option>
                                    <option value="tech">Tech Support</option>
                                    <option value="hr">HR</option>
                                </select>
                            </div>
                        )}

                        <div className="row">
                            <div className="col-8"></div>
                            <div className="col-4">
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary">{isRegister ? 'Register' : 'Sign In'}</button>
                                </div>
                            </div>
                        </div>
                    </form>

                    <p className="mb-0 mt-3 text-center">
                        <a href="#" className="text-center" onClick={(e) => { e.preventDefault(); setIsRegister(!isRegister); }}>
                            {isRegister ? 'I already have a membership' : 'Register a new membership'}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

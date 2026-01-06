import "./styles/dashboards.css";

export default function AdminDashboard() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li>Overview</li>
          <li>User Management</li>
          <li>System Settings</li>
          <li>Roles & Permissions</li>
        </ul>
      </aside>

      <main className="main">
        <div className="main-header">
          <h1>Admin Dashboard</h1>
          <span className="badge">Role: Admin</span>
        </div>

        <div className="cards">
          <div className="card">
            <div className="card-title">Total Users</div>
            <div className="card-value">128</div>
          </div>
          <div className="card">
            <div className="card-title">Active Sessions</div>
            <div className="card-value">34</div>
          </div>
          <div className="card">
            <div className="card-title">Pending Approvals</div>
            <div className="card-value">5</div>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>vani</td>
              <td>Sales</td>
              <td>Active</td>
            </tr>
            <tr>
              <td>kumar</td>
              <td>Support</td>
              <td>Active</td>
            </tr>
            <tr>
              <td>rahul</td>
              <td>Developer</td>
              <td>Invited</td>
            </tr>
          </tbody>
        </table>
      </main>
    </div>
  );
}
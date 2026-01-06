import "./styles/dashboards.css";

export default function DeveloperDashboard() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Development</h2>
        <ul>
          <li>Tasks</li>
          <li>Code Reviews</li>
          <li>Deployments</li>
          <li>APIs</li>
        </ul>
      </aside>

      <main className="main">
        <div className="main-header">
          <h1>Developer Dashboard</h1>
          <span className="badge">Role: Developer</span>
        </div>

        <div className="cards">
          <div className="card">
            <div className="card-title">Open Tasks</div>
            <div className="card-value">7</div>
          </div>
          <div className="card">
            <div className="card-title">Pending Reviews</div>
            <div className="card-value">3</div>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Status</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Login Role Routing</td>
              <td>In Progress</td>
              <td>Vani</td>
            </tr>
            <tr>
              <td>CRUD Refactor</td>
              <td>Pending</td>
              <td>John</td>
            </tr>
          </tbody>
        </table>
      </main>
    </div>
  );
}
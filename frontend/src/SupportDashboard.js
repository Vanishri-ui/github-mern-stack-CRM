import "./styles/dashboards.css";

export default function SupportDashboard() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Support</h2>
        <ul>
          <li>Tickets</li>
          <li>Live Calls</li>
          <li>Escalations</li>
          <li>Knowledge Base</li>
        </ul>
      </aside>

      <main className="main">
        <div className="main-header">
          <h1>Support Dashboard</h1>
          <span className="badge">Role: Tech Support</span>
        </div>

        <div className="cards">
          <div className="card">
            <div className="card-title">Open Tickets</div>
            <div className="card-value">18</div>
          </div>
          <div className="card">
            <div className="card-title">Today Resolved</div>
            <div className="card-value">9</div>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Customer</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#1021</td>
              <td>Tech Xenos</td>
              <td>High</td>
            </tr>
            <tr>
              <td>#1022</td>
              <td>Crezvatic Pvt Ltd</td>
              <td>Medium</td>
            </tr>
          </tbody>
        </table>
      </main>
    </div>
  );
}
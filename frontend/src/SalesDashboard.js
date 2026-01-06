import "./styles/dashboards.css";

export default function SalesDashboard() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Sales</h2>
        <ul>
          <li>Leads</li>
          <li>Opportunities</li>
          <li>Calls</li>
          <li>Reports</li>
        </ul>
      </aside>

      <main className="main">
        <div className="main-header">
          <h1>Sales Dashboard</h1>
          <span className="badge">Role: Sales</span>
        </div>

        <div className="cards">
          <div className="card">
            <div className="card-title">Today Calls</div>
            <div className="card-value">22</div>
          </div>
          <div className="card">
            <div className="card-title">New Leads</div>
            <div className="card-value">11</div>
          </div>
          <div className="card">
            <div className="card-title">Deals Closed</div>
            <div className="card-value">4</div>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Lead Name</th>
              <th>Stage</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tech Xenos</td>
              <td>Proposal Sent</td>
              <td>₹40,000</td>
            </tr>
            <tr>
              <td>ABC Corp</td>
              <td>Negotiation</td>
              <td>₹75,000</td>
            </tr>
          </tbody>
        </table>
      </main>
    </div>
  );
}
import "./styles/dashboards.css";

export default function FinanceDashboard() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Finance</h2>
        <ul>
          <li>Revenue</li>
          <li>Expenses</li>
          <li>Profit</li>
          <li>Reports</li>
        </ul>
      </aside>

      <main className="main">
        <div className="main-header">
          <h1>Finance Dashboard</h1>
          <span className="badge">Role: Finance</span>
        </div>

        <div className="cards">
          <div className="card">
            <div className="card-title">Monthly Revenue</div>
            <div className="card-value">₹8,40,000</div>
          </div>
          <div className="card">
            <div className="card-title">Monthly Spend</div>
            <div className="card-value">₹4,10,000</div>
          </div>
        </div>
      </main>
    </div>
  );
}
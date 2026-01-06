import "./styles/dashboards.css";

export default function BillingDashboard() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Billing</h2>
        <ul>
          <li>Invoices</li>
          <li>Payments</li>
          <li>Emi</li>
          <li>Plans</li>
        </ul>
      </aside>

      <main className="main">
        <div className="main-header">
          <h1>Billing Dashboard</h1>
          <span className="badge">Role: Billing</span>
        </div>

        <div className="cards">
          <div className="card">
            <div className="card-title">Pending Invoices</div>
            <div className="card-value">6</div>
          </div>
          <div className="card">
            <div className="card-title">Paid Today</div>
            <div className="card-value">₹1,20,000</div>
          </div>
        </div>
      </main>
    </div>
  );
}
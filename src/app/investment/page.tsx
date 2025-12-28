export const metadata = {
  title: "Investment Opportunity | Unitech Grand Ocean",
};

export default function InvestmentPage() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="title">
          Own a share of oceanfront luxury — and let it earn for you
        </h1>
        <p className="subtitle" style={{ marginTop: 8 }}>
          Unitech Grand Ocean Resort & Suites offers a rare opportunity to own a full luxury
          suite or a share of a suite within a professionally managed five-star standard
          resort. Owners enjoy personal usage privileges while earning rental income when
          the unit is operated as part of the hotel pool.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
          <div style={{ border: "1px solid rgba(11,60,93,0.15)", borderRadius: 12, padding: 12 }}>
            <h3 className="title">Ownership Models:</h3>
            <ul style={{ marginTop: 8, paddingLeft: 18 }}>
              <li>full suite ownership</li>
              <li>fractional/share ownership</li>
            </ul>
          </div>
          <div style={{ border: "1px solid rgba(11,60,93,0.15)", borderRadius: 12, padding: 12 }}>
            <h3 className="title">Investor Benefits:</h3>
            <ul style={{ marginTop: 8, paddingLeft: 18 }}>
              <li>regular rental income</li>
              <li>appreciation of property value</li>
              <li>no burden of daily management</li>
              <li>high tourism demand in Cox’s Bazar</li>
              <li>NRB-friendly investment process</li>
              <li>prestigious oceanfront property asset</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}


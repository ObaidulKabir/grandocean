export const metadata = {
  title: "About the Project | Unitech Grand Ocean",
};

export default function AboutPage() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="title">A new chapter of oceanfront luxury living</h1>
        <div style={{ marginTop: 12, borderRadius: 12, overflow: "hidden" }}>
          <picture>
            <source srcSet={"/images/3d%20View.png"} type="image/png" />
            <img src={"/images/3d%20View.png"} alt="3D project view" style={{ width: "100%", display: "block" }} />
          </picture>
        </div>
        <p className="subtitle" style={{ marginTop: 8 }}>
          Unitech Grand Ocean Resort & Suites has been designed to blend luxury hospitality
          with long-term investment value. Overlooking the Bay of Bengal and surrounded by
          natural beauty, the resort offers a sophisticated environment for families,
          travelers, and investors.
        </p>
        <p className="subtitle" style={{ marginTop: 10 }}>
          Located within Rupayan Beach View — a secure and fully-featured beachfront
          township — the project enjoys access to internal roads, shopping zones,
          entertainment facilities, and private beach space.
        </p>
        <div style={{ marginTop: 16 }}>
          <p className="subtitle">This resort is created for people who want:</p>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            <li>a holiday home by the sea</li>
            <li>a secure income-generating asset</li>
            <li>a prestigious address in Cox’s Bazar</li>
            <li>stress-free ownership with professional management</li>
          </ul>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
          <div style={{ border: "1px solid rgba(11,60,93,0.15)", borderRadius: 12, padding: 12 }}>
            <h3 className="title">Mission Statement</h3>
            <p className="subtitle" style={{ marginTop: 8 }}>
              To deliver world-class coastal hospitality in Bangladesh while creating strong,
              sustainable investment value for our clients.
            </p>
          </div>
          <div style={{ border: "1px solid rgba(11,60,93,0.15)", borderRadius: 12, padding: 12 }}>
            <h3 className="title">Vision Statement</h3>
            <p className="subtitle" style={{ marginTop: 8 }}>
              To become the most trusted and admired oceanfront resort ownership brand in Cox’s
              Bazar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

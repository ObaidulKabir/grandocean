export const metadata = {
  title: "Location & Connectivity | Unitech Grand Ocean",
};

export default function LocationPage() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Prime beachfront location at Rupayan Beach View</h1>
        <div style={{ marginTop: 12, borderRadius: 12, overflow: "hidden" }}>
          <img
            src={"/images/Hotel%20Entrance.png"}
            alt="Hotel entrance"
            style={{ width: "100%", display: "block" }}
          />
        </div>
        <p className="subtitle" style={{ marginTop: 8 }}>
          The project is located within Rupayan Beach View — a modern beachfront housing and
          resort community featuring shopping, entertainment, security services, and direct
          access to the beach. The tranquil Sampan Beach is just a short walk away, offering
          a clean and quiet seaside experience away from city congestion.
        </p>
        <h3 className="title" style={{ marginTop: 16 }}>Location Advantages:</h3>
        <ul style={{ marginTop: 8, paddingLeft: 18 }}>
          <li>inside Rupayan Beach View housing complex</li>
          <li>adjacent to Sampan Beach</li>
          <li>approximately 30 minutes from Cox’s Bazar city and main beach</li>
          <li>easy access to Marine Drive</li>
          <li>convenient route to Inani and Teknaf attractions</li>
          <li>peaceful environment away from crowd and noise</li>
        </ul>
        <div style={{ marginTop: 20 }}>
          <h3 className="title">Google Map</h3>
          <div style={{ border: "1px solid rgba(11,60,93,0.15)", borderRadius: 12, height: 300, display: "grid", placeItems: "center" }}>
            Map embed placeholder
          </div>
        </div>
      </div>
    </section>
  );
}

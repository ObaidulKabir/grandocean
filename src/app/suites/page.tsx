export const metadata = {
  title: "Suites & Facilities | Unitech Grand Ocean",
};

export default function SuitesPage() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Luxury suites designed for comfort and elegance</h1>
        <div style={{ marginTop: 12, borderRadius: 12, overflow: "hidden" }}>
          <img
            src={"/images/Suit%20with%20sea%20view.png"}
            alt="Suite with sea view"
            style={{ width: "100%", display: "block" }}
          />
        </div>
        <p className="subtitle" style={{ marginTop: 8 }}>
          Each suite at Unitech Grand Ocean Resort & Suites is thoughtfully designed to
          maximize sea views, natural light, and privacy. Premium finishes, elegant
          interiors, and modern conveniences create a refined living environment suitable
          for both leisure and business travelers.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 16 }}>
          <div>
            <h3 className="title">Room Features:</h3>
            <ul style={{ marginTop: 8, paddingLeft: 18 }}>
              <li>private balcony</li>
              <li>sea or pool view</li>
              <li>elegant bedroom and living space</li>
              <li>high-quality flooring and fittings</li>
              <li>attached modern bathroom</li>
              <li>air-conditioning</li>
              <li>smart access and security features</li>
            </ul>
          </div>
          <div>
            <h3 className="title">Resort Facilities:</h3>
            <ul style={{ marginTop: 8, paddingLeft: 18 }}>
              <li>grand hotel lobby and reception</li>
              <li>rooftop or infinity swimming pool</li>
              <li>multi-cuisine restaurant</li>
              <li>coffee lounge</li>
              <li>spa and wellness facilities</li>
              <li>well-equipped gym</li>
              <li>children’s play area</li>
              <li>prayer room</li>
              <li>business/conference facilities</li>
              <li>24/7 security and CCTV monitoring</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

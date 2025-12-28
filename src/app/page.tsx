import HeroSlider from "@/components/HeroSlider";
import ContactForm from "@/components/ContactForm";

export default function Home() {
  return (
    <>
      <HeroSlider />

      <section className="section">
        <div className="container">
          <h2 className="title">Unitech Grand Ocean Resort & Suites</h2>
          <p className="subtitle" style={{ marginTop: 8 }}>
            Unitech Grand Ocean Resort & Suites is a five-star standard luxury hotel resort
            located inside the prestigious Rupayan Beach View project at Cox’s Bazar. Just a
            few minutes’ walk from the serene Sampan Beach, this resort brings together
            oceanfront living, world-class hospitality, and a smart investment opportunity
            in one exclusive destination.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 16 }}>
            {[
              "Sea-view luxury suites",
              "Five-star hotel standards",
              "Located inside Rupayan Beach View",
              "Access to Sampan Beach",
              "30 minutes from Cox’s Bazar town and main beach",
              "Professionally managed resort operations",
              "Opportunity to own full suite or share",
              "Earn rental income without managing property",
            ].map((item) => (
              <div
                key={item}
                style={{
                  border: "1px solid rgba(11,60,93,0.15)",
                  borderRadius: 12,
                  padding: 12,
                  background: "#fff",
                }}
              >
                {item}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <a href="#consult" className="roundedBtn" style={{ background: "var(--blue)", color: "#fff", padding: "10px 14px", fontWeight: 600 }}>
              Book a consultation
            </a>
            <a href="#price" className="roundedBtn" style={{ background: "var(--gold)", color: "#0b3c5d", padding: "10px 14px", fontWeight: 700 }}>
              Request price details
            </a>
            <a href="/downloads" className="roundedBtn" style={{ background: "rgba(11,60,93,0.1)", color: "var(--blue)", padding: "10px 14px", fontWeight: 600 }}>
              Download project brochure
            </a>
          </div>
        </div>
      </section>

      <ContactForm />
    </>
  );
}

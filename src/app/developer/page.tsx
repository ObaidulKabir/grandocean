export const metadata = {
  title: "Developer Profile | Unitech Grand Ocean",
};

export default function DeveloperPage() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Developed by Unitech Holdings Limited</h1>
        <p className="subtitle" style={{ marginTop: 8 }}>
          Unitech Holdings Limited is a trusted real estate developer engaged in
          residential and commercial projects across major cities in Bangladesh. With
          commitment to quality, transparency, and long-term client relationships,
          Unitech is expanding into the hospitality and resort sector with Unitech Grand
          Ocean Resort & Suites.
        </p>
        <h3 className="title" style={{ marginTop: 16 }}>Credibility Points:</h3>
        <ul style={{ marginTop: 8, paddingLeft: 18 }}>
          <li>experience in land development and construction</li>
          <li>multiple completed and ongoing projects</li>
          <li>customer-focused approach</li>
          <li>commitment to legal and ethical compliance</li>
        </ul>
      </div>
    </section>
  );
}


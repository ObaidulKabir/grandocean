import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact & Booking | Unitech Grand Ocean",
};

export default function ContactPage() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Get in touch with us</h1>
        <p className="subtitle" style={{ marginTop: 8 }}>
          Interested in owning a luxury suite or share at Unitech Grand Ocean Resort & Suites?
          Send us a message or call us — our team will guide you through every step.
        </p>
        <div style={{ marginTop: 16 }}>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}


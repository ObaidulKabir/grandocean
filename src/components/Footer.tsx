import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandBlock}>
          <div className={styles.brand}>Unitech Grand Ocean</div>
          <p className={styles.tagline}>
            Invest, Relax, Earn — Own a share of oceanfront luxury
          </p>
        </div>
        <div className={styles.columns}>
          <div>
            <h4>Explore</h4>
            <ul>
              <li>
                <Link href="/about">About the Project</Link>
              </li>
              <li>
                <Link href="/suites">Suites & Facilities</Link>
              </li>
              <li>
                <Link href="/investment">Investment Opportunity</Link>
              </li>
              <li>
                <Link href="/location">Location & Connectivity</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/developer">Developer Profile</Link>
              </li>
              <li>
                <Link href="/downloads">Downloads & Brochure</Link>
              </li>
              <li>
                <Link href="/contact">Contact & Booking</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <p>
              Phone: <a href="tel:+8801000000000">+880 10-0000-0000</a>
            </p>
            <p>
              WhatsApp:{" "}
              <a href="https://wa.me/8801000000000" target="_blank">
                Chat on WhatsApp
              </a>
            </p>
          </div>
        </div>
        <div className={styles.bottom}>
          <small>© {new Date().getFullYear()} Unitech Holdings Limited</small>
        </div>
      </div>
    </footer>
  );
}


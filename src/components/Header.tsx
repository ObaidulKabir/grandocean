import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About the Project" },
  { href: "/suites", label: "Suites & Facilities" },
  { href: "/investment", label: "Investment Opportunity" },
  { href: "/location", label: "Location & Connectivity" },
  { href: "/developer", label: "Developer Profile" },
  { href: "/downloads", label: "Downloads & Brochure" },
  { href: "/contact", label: "Contact & Booking" },
];

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand}>
          <Image
            src="/logo.png"
            alt="Unitech Grand Ocean"
            width={280}
            height={80}
            priority
            className={styles.brandLogo}
          />
          <span className={styles.brandText}>
            <span className={styles.brandPrimary}>Unitech</span>{" "}
            <span className={styles.brandSecondary}>Grand Ocean</span>
          </span>
        </Link>
        <nav className={styles.nav}>
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className={styles.navLink}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className={styles.actions}>
          <Link href="/contact" className={styles.primaryBtn}>
            Request Call Back
          </Link>
          <a href="tel:+8801000000000" className={styles.phone}>
            +880 10-0000-0000
          </a>
        </div>
      </div>
    </header>
  );
}

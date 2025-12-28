"use client";
import { useEffect, useState } from "react";
import styles from "./HeroSlider.module.css";

const slides = [
  {
    title: "Unitech Grand Ocean Resort & Suites",
    subtitle: "Invest, Relax, Earn — Own a share of oceanfront luxury",
    image: "/images/Hotel Entrance.png",
  },
  {
    title: "Sea-view luxury suites",
    subtitle: "Five-star hotel standards at Rupayan Beach View",
    image: "/images/Suit with sea view.png",
  },
  {
    title: "Own full suite or share",
    subtitle: "Earn rental income without managing property",
    image: "/images/Roof Top view.png",
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);
  const s = slides[index];
  return (
    <section
      className={styles.hero}
      style={{ backgroundImage: `url("${s.image}")` }}
    >
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1 className={styles.title}>{s.title}</h1>
        <p className={styles.subtitle}>{s.subtitle}</p>
        <div className={styles.cta}>
          <a href="#consult" className={styles.btnPrimary}>
            Book a consultation
          </a>
          <a href="#price" className={styles.btnSecondary}>
            Request price details
          </a>
          <a href="/downloads" className={styles.btnSecondary}>
            Download project brochure
          </a>
        </div>
      </div>
      <div className={styles.waves} />
    </section>
  );
}

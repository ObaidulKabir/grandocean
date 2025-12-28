"use client";
import { useState } from "react";
import styles from "./ContactForm.module.css";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error" | "loading">("idle");
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    city: "",
    message: "",
  });
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setForm({ name: "", mobile: "", email: "", city: "", message: "" });
    } catch {
      setStatus("error");
    }
  };
  return (
    <section className={styles.section} id="consult">
      <h3 className={styles.title}>Get in touch with us</h3>
      <p className={styles.lead}>
        Interested in owning a luxury suite or share at Unitech Grand Ocean Resort & Suites? Send us a message or call us — our team will guide you through every step.
      </p>
      <form className={styles.form} onSubmit={onSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={onChange}
          required
        />
        <input
          name="mobile"
          placeholder="Mobile / WhatsApp"
          value={form.mobile}
          onChange={onChange}
          required
        />
        <input name="email" placeholder="Email" value={form.email} onChange={onChange} />
        <input
          name="city"
          placeholder="City / Country"
          value={form.city}
          onChange={onChange}
        />
        <textarea
          name="message"
          placeholder="Message"
          value={form.message}
          onChange={onChange}
          rows={4}
        />
        <button type="submit" className={styles.submit} disabled={status === "loading"}>
          {status === "loading" ? "Sending..." : "Send Message"}
        </button>
      </form>
      {status === "success" && (
        <div className={styles.success}>Thank you! We will contact you shortly.</div>
      )}
      {status === "error" && (
        <div className={styles.error}>Something went wrong. Please try again.</div>
      )}
    </section>
  );
}


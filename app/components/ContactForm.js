"use client";
import { useState } from "react";

const FIELD_CLS =
  "w-full rounded-xl border border-line/70 bg-ash px-4 py-3 text-sm text-ink placeholder-[#777777] outline-none transition focus:border-gold focus:bg-ash focus:shadow-[0_0_0_3px_rgba(212,175,55,0.15)]";

export default function ContactForm({ email, className = "" }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const subject = encodeURIComponent(form.subject.trim() || `Message from ${form.name.trim() || "your portfolio"}`);
    const body = encodeURIComponent(`${form.message.trim()}\n\n— ${form.name.trim()}\n${form.email.trim()}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col rounded-3xl border border-line bg-slate p-6 sm:p-8 ${className}`}
    >
      <span className="mono-label !text-gold">. Send a message</span>
      <div className="grid gap-4 mt-6 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="mono-label !text-ink/55">Name</span>
          <input required value={form.name} onChange={update("name")} placeholder="Your name" className={FIELD_CLS} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="mono-label !text-ink/55">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="you@example.com"
            className={FIELD_CLS}
          />
        </label>
      </div>
      <label className="flex flex-col gap-2 mt-4">
        <span className="mono-label !text-ink/55">Subject</span>
        <input value={form.subject} onChange={update("subject")} placeholder="What is this about?" className={FIELD_CLS} />
      </label>
      <label className="flex flex-col gap-2 mt-4">
        <span className="mono-label !text-ink/55">Message</span>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={update("message")}
          placeholder="Tell me about your project..."
          className={`${FIELD_CLS} resize-none`}
        />
      </label>
      <button
        type="submit"
        className="mt-6 self-start rounded-full bg-gold px-6 py-3 text-[12px] font-bold text-black shadow-[0_8px_24px_-12px_rgba(212,175,55,0.5)] transition hover:bg-gold-bright hover:-translate-y-0.5"
      >
        Send Message
      </button>
    </form>
  );
}
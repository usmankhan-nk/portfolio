"use client";

/**
 * Final signature / identity section.
 *
 * Sits after Contact and before the footer. The name reuses the existing
 * `.section-heading` reveal (useHeadingReveal) so it emerges from a lowered,
 * blurred state with the same soft dark-gold glow as every other heading on
 * the page - no new animation library is introduced. The badge, hairlines and
 * sub-line ride the existing `.reveal` system (useReveal).
 *
 * Layout is plain CSS: with JS unavailable, or with prefers-reduced-motion,
 * everything is simply visible.
 */
export default function SignatureSection() {
  return (
    <section
      id="signature"
      className="signature relative overflow-hidden bg-coal px-5 md:px-10 py-20 md:py-28 border-t border-line"
    >
      {/* Soft, very low dark-gold bloom behind the name. Decorative only. */}
      <div className="signature-glow" aria-hidden="true" />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <span className="mono-label !text-gold border border-line rounded-full px-3.5 py-1.5 bg-slate inline-block reveal">
          . Signature
        </span>

        <div className="signature-rule reveal mt-8 md:mt-10" aria-hidden="true" />

        <h2 className="section-heading signature-name font-black text-gold my-6 md:my-8">
          <span className="sig-line">Muhammad</span>{" "}
          <span className="sig-line">Usman Khan</span>
        </h2>

        <div className="signature-rule reveal" aria-hidden="true" />

        <p className="mono-label !text-ink/55 mt-8 md:mt-10 reveal">
          Full-stack developer
        </p>
      </div>
    </section>
  );
}

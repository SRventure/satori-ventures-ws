"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import emailjs from "@emailjs/browser";
import { AnimatePresence, motion, useInView } from "framer-motion";
import Magnetic from "@/components/Magnetic";
import VerticalCutReveal from "@/components/ui/vertical-cut-reveal";
import { useReducedMotion, useTheme } from "@/components/providers/Providers";
import { CITIES } from "@/lib/cities";

const Globe = dynamic(() => import("@/components/ContactGlobe"), { ssr: false });

const SERVICE_ID =
  process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_q7rgzm8";
const TEMPLATE_ID =
  process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_4zis24c";
const PUBLIC_KEY =
  process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "RElQ17WxbehSv1AID";

function Field({
  id,
  name,
  label,
  type = "text",
  textarea = false,
  required = true,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  textarea?: boolean;
  required?: boolean;
}) {
  const cls = "line-input mt-2 font-sans";
  return (
    <div className="group/field">
      <label
        htmlFor={id}
        className="font-mono text-[10px] uppercase tracking-[0.26em] text-ink-2 transition-colors group-focus-within/field:text-gold"
      >
        {label} {required && <span className="text-crimson">*</span>}
      </label>
      {textarea ? (
        <textarea id={id} name={name} required={required} rows={4} className={`${cls} resize-none`} />
      ) : (
        <input id={id} name={name} type={type} required={required} className={cls} />
      )}
    </div>
  );
}

export default function Contact() {
  const reduce = useReducedMotion();
  const { theme } = useTheme();
  const ref = useRef<HTMLElement>(null);
  const near = useInView(ref, { margin: "400px 0px 400px 0px" });
  const [webgl, setWebgl] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    setWebgl(!reduce);
  }, [reduce]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form, {
        publicKey: PUBLIC_KEY,
      });
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section ref={ref} id="contact" className="hairline-t relative overflow-hidden py-24 md:py-32">
      {/* faint perspective grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "repeating-linear-gradient(to right, rgb(var(--accent-gold) / 0.025) 0 1px, transparent 1px 64px), repeating-linear-gradient(to bottom, rgb(var(--accent-gold) / 0.025) 0 1px, transparent 1px 64px)",
        }}
      />

      <div className="relative mx-auto w-full max-w-wide px-6 md:px-10">
        <p className="eyebrow eyebrow-tick mb-7">05 / Engagement portal</p>
        <h2 className="display-xl text-[clamp(44px,8vw,116px)]">
          <span className="block">
            <VerticalCutReveal staggerDuration={0.025}>LET'S BUILD</VerticalCutReveal>
          </span>
          <span className="block">
            <span className="text-gold">
              <VerticalCutReveal staggerDuration={0.025} delay={0.25}>
                THE FUTURE
              </VerticalCutReveal>
            </span>
            <span className="text-crimson">.</span>
          </span>
        </h2>

        <div className="mt-16 grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-10">
          {/* left: global presence globe */}
          <div className="relative order-2 lg:order-1">
            {webgl && near && (
              <div className="h-[340px] w-full sm:h-[420px] lg:h-[480px]" data-cursor-hover>
                <Globe dark={theme === "dark"} />
              </div>
            )}
            <div className={webgl ? "mt-2" : "mt-0"}>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-2">
                Global presence // rooted in Asia
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
                {CITIES.map((c) => (
                  <li key={c.code} className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink">
                    <span
                      className={`inline-block h-[5px] w-[5px] rounded-full ${c.hq ? "bg-crimson" : "bg-gold"}`}
                    />
                    {c.code}
                    <span className="text-ink-2">
                      {c.hq ? "// HQ" : "// Active"}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href="mailto:contact@srventures.io"
                className="mt-6 inline-block font-display text-[17px] font-bold uppercase tracking-[0.04em] text-ink transition-colors hover:text-gold"
              >
                contact@srventures.io
              </a>
            </div>
          </div>

          {/* right: terminal form */}
          <div className="glass-card relative order-1 p-8 md:p-10 lg:order-2">
            {/* scanline texture */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "repeating-linear-gradient(to bottom, rgb(var(--accent-gold) / 0.02) 0 1px, transparent 1px 4px)",
              }}
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-gold">
              Secure channel // open
            </p>

            <AnimatePresence mode="wait">
              {status === "sent" ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex min-h-[380px] flex-col items-center justify-center text-center"
                >
                  <motion.span
                    initial={reduce ? false : { scale: 2.4, opacity: 0, rotate: -18 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold text-[26px] text-gold"
                    style={{ boxShadow: "0 0 34px rgb(var(--accent-gold) / 0.35)" }}
                  >
                    ✓
                  </motion.span>
                  <p className="mt-6 font-display text-[22px] font-black uppercase tracking-[0.08em] text-ink">
                    Transmission received
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2">
                    We answer fast — conviction doesn't wait for Monday
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={onSubmit}
                  className="relative mt-8 space-y-8"
                  animate={status === "error" && !reduce ? { x: [0, -8, 8, -5, 5, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <div className="grid gap-8 sm:grid-cols-2">
                    <Field id="c-name" name="from_name" label="Name" />
                    <Field id="c-email" name="reply_to" label="Email" type="email" />
                  </div>
                  <Field id="c-company" name="company" label="Company" required={false} />
                  <Field id="c-message" name="message" label="Message" textarea />

                  <div className="flex flex-wrap items-center gap-5 pt-2">
                    <Magnetic>
                      <button
                        type="submit"
                        disabled={status === "sending"}
                        className="engage-pill relative overflow-hidden !px-12 !py-4 !text-[12px] disabled:opacity-60"
                      >
                        {status === "sending" ? (
                          <span className="inline-flex gap-1">
                            Transmitting
                            <span className="animate-pulse">.</span>
                            <span className="animate-pulse [animation-delay:150ms]">.</span>
                            <span className="animate-pulse [animation-delay:300ms]">.</span>
                          </span>
                        ) : (
                          "Transmit ↗"
                        )}
                      </button>
                    </Magnetic>
                    <p aria-live="polite" className="font-mono text-[11px] text-ink-2">
                      {status === "error" && (
                        <span>
                          Channel error — email{" "}
                          <a href="mailto:contact@srventures.io" className="text-gold underline">
                            contact@srventures.io
                          </a>
                        </span>
                      )}
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Magnetic from "@/components/Magnetic";
import { useReducedMotion } from "@/components/providers/Providers";

const SERVICE_ID =
  process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_q7rgzm8";
const TEMPLATE_ID =
  process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_4zis24c";
const PUBLIC_KEY =
  process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "RElQ17WxbehSv1AID";

export default function Contact() {
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

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
    <section id="contact" className="relative overflow-hidden border-t border-ink-3/25 py-28 md:py-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 opacity-[0.07]"
        style={{ background: "radial-gradient(ellipse, rgb(var(--accent-gold)) 0%, rgb(var(--accent-red)) 38%, transparent 62%)" }}
      />
      <div className="relative mx-auto w-full max-w-wide px-6 md:px-10">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-[clamp(44px,9vw,130px)] leading-[1.02] text-ink"
        >
          Let&apos;s build
          <br />
          the <span className="italic text-gold">future</span><span className="text-crimson">.</span>
        </motion.h2>

        <div className="mt-16 grid gap-16 lg:grid-cols-[1fr_420px]">
          <form onSubmit={onSubmit} className="max-w-[640px] space-y-10">
            <div className="grid gap-10 sm:grid-cols-2">
              <div>
                <label htmlFor="c-name" className="eyebrow block">Name</label>
                <input
                  id="c-name"
                  name="from_name"
                  type="text"
                  required
                  placeholder="Your name"
                  className="line-input mt-3"
                />
              </div>
              <div>
                <label htmlFor="c-email" className="eyebrow block">Email</label>
                <input
                  id="c-email"
                  name="reply_to"
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="line-input mt-3"
                />
              </div>
            </div>
            <div>
              <label htmlFor="c-message" className="eyebrow block">Message</label>
              <textarea
                id="c-message"
                name="message"
                required
                rows={3}
                placeholder="Tell us what you're building"
                className="line-input mt-3 resize-none"
              />
            </div>

            <div className="flex items-center gap-6">
              <Magnetic>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="group inline-flex items-center gap-2 border border-gold px-10 py-4 font-sans text-[14px] font-medium uppercase tracking-[0.18em] text-gold transition-all duration-300 hover:border-crimson hover:bg-crimson hover:text-white disabled:opacity-50"
                >
                  {status === "sending" ? "Sending…" : "Start the conversation"}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              </Magnetic>
              <p aria-live="polite" className="font-sans text-[14px] text-ink-2">
                {status === "sent" && <span className="text-gold">Message sent — we&apos;ll be in touch.</span>}
                {status === "error" && (
                  <span>
                    Something broke — email us at{" "}
                    <a href="mailto:contact@srventures.io" className="text-gold underline">
                      contact@srventures.io
                    </a>
                  </span>
                )}
              </p>
            </div>
          </form>

          <div className="space-y-8 lg:pt-2">
            <div>
              <p className="eyebrow">Email</p>
              <a
                href="mailto:contact@srventures.io"
                className="nav-link mt-2 inline-block font-serif text-[22px] text-ink transition-colors hover:text-gold"
              >
                contact@srventures.io
              </a>
            </div>
            <div>
              <p className="eyebrow">Presence</p>
              <p className="mt-2 font-sans text-[15px] font-light leading-relaxed text-ink-2">
                Global reach, rooted in Asia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

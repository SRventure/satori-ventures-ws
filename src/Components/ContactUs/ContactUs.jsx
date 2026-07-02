import Container from '../Container/Container';
import { useForm } from 'react-hook-form';
import emailjs from '@emailjs/browser';
import { useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Reveal from '../../motion/Reveal';

const inputClass =
  'input w-full bg-white placeholder:text-[14px] placeholder:text-[#6F5D5B]/60 pl-4 font-dmSans text-[#441611] border border-[#441611]/10 rounded-xl focus:border-[#9B0801] focus:outline-none transition-colors duration-200';

const labelClass = 'label-text text-[#441611] text-[13px] font-inter font-semibold uppercase tracking-[0.12em]';

const ContactUs = () => {
  const form = useRef();
  const [sending, setSending] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    // Honeypot: real users never fill this hidden field; bots do.
    if (data.company_website) return;
    if (sending) return;

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_q7rgzm8';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_4zis24c';
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'RElQ17WxbehSv1AID';

    setSending(true);
    emailjs
      .sendForm(serviceId, templateId, form.current, { publicKey })
      .then(
        () => {
          reset();
          toast.success("Message sent — we'll be in touch shortly.");
        },
        (error) => {
          console.error('FAILED...', error?.text);
          toast.error('Something went wrong. Please try again or email us directly.');
        }
      )
      .finally(() => setSending(false));
  };

  return (
    <section id="contact" className="bg-[#F6F4F2] py-24 md:py-32 border-t border-[#441611]/[0.06]">
      <Toaster />
      <Container>
        <div className="md:flex gap-x-16">
          <div className="md:w-[45%] mb-14 md:mb-0">
            <Reveal>
              <p className="eyebrow mb-4">Contact</p>
              <h2 className="font-dmSerifDisplay text-[#441611] text-[36px] md:text-[44px] xl:text-[50px] leading-[1.12]">
                Let&apos;s start the
                <br />
                conversation
              </h2>
              <div className="w-14 h-[3px] bg-[#9B0801] mt-6" />
            </Reveal>

            <Reveal delay={0.15}>
              <p className="font-dmSans text-[#6F5D5B] text-[16px] leading-relaxed mt-8 max-w-[400px]">
                Building something transformative in Web3 or AI? We&apos;d love to hear
                from you.
              </p>
              <a
                href="mailto:contact@srventures.io"
                className="inline-block font-dmSans text-[#9B0801] font-semibold text-[16px] mt-5 hover:underline underline-offset-4"
              >
                contact@srventures.io
              </a>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="md:w-[55%]">
            <form ref={form} onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-[#441611]/[0.06] p-7 md:p-9 shadow-[0_10px_40px_rgba(68,22,17,0.05)]">
              {/* Honeypot — hidden from users, catches bots */}
              <input
                type="text"
                tabIndex="-1"
                autoComplete="off"
                {...register('company_website')}
                name="company_website"
                className="hidden"
                aria-hidden="true"
              />

              <div className="md:flex gap-x-4 mb-4">
                <div className="form-control md:w-1/2 mb-4 md:mb-0">
                  <label className="label mb-1" htmlFor="contact-name">
                    <span className={labelClass}>Full Name</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    {...register('name', { required: true })}
                    name="name"
                    placeholder="Your full name"
                    className={inputClass}
                  />
                  {errors.name && <span className="text-[13px] text-[#9B0801] mt-1">Name is required</span>}
                </div>

                <div className="form-control md:w-1/2">
                  <label className="label mb-1" htmlFor="contact-email">
                    <span className={labelClass}>Email</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    {...register('email', { required: true })}
                    name="email"
                    placeholder="you@company.com"
                    className={inputClass}
                  />
                  {errors.email && <span className="text-[13px] text-[#9B0801] mt-1">Email is required</span>}
                </div>
              </div>

              <div className="form-control mb-4">
                <label className="label mb-1" htmlFor="contact-subject">
                  <span className={labelClass}>Subject</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  {...register('subject', { required: true })}
                  name="subject"
                  placeholder="What's this about?"
                  className={inputClass}
                />
                {errors.subject && <span className="text-[13px] text-[#9B0801] mt-1">Subject is required</span>}
              </div>

              <div className="form-control">
                <label className="label mb-1" htmlFor="contact-message">
                  <span className={labelClass}>Message</span>
                </label>
                <textarea
                  id="contact-message"
                  {...register('message', { required: true })}
                  name="message"
                  placeholder="Tell us about what you're building…"
                  className={`${inputClass} textarea h-36 pt-3`}
                ></textarea>
                {errors.message && <span className="text-[13px] text-[#9B0801] mt-1">Message is required</span>}
              </div>

              <div className="form-control mt-7">
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-[#9B0801] hover:bg-[#7d0701] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[15px] font-dmSans font-semibold px-9 py-3.5 rounded-full w-fit transition-colors duration-200"
                >
                  {sending ? 'Sending…' : 'Send Message'}
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </Container>
    </section>
  );
};

export default ContactUs;

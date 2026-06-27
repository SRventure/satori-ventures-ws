import Container from "../Container/Container";
import { useForm } from "react-hook-form"
import emailjs from '@emailjs/browser';
import { useRef } from "react";
import toast from 'react-hot-toast';

const ContactUs = () => {
  const form = useRef();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const onSubmit = (data) => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_q7rgzm8';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_4zis24c';
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'RElQ17WxbehSv1AID';

    emailjs
      .sendForm(serviceId, templateId, form.current, {
        publicKey,
      })
      .then(
        () => {
          reset();
          toast.success('Email send successfully');
          // console.log('SUCCESS!');
        },
        (error) => {
          console.error('FAILED...', error?.text);
          toast.error('Something went wrong. Please try again or email us directly.');
        },
      );
  };

  return (
    <div className="bg-[#F6F4F2] pt-[100px] pb-[120px]" id="contact">
      <Container>
        <div className="md:flex">
          <div className="md:w-1/2 md:pl-[40px] xl:pl-[60px] mb-12 md:mb-0">
            <h2 className="text-[33px] md:text-[32px] xl:text-[41px] text-[#441611] font-dmSerifDisplay leading-[58px]" data-aos="fade-up" data-aos-easing="linear" data-aos-duration="800">Let's start the <br /> conversation here</h2>

            <p className="text-[#6F5D5B] font-dmSans sm:w-[70%] md:w-[80%] xl:w-[84%] 2xl:w-[50%]" data-aos="fade-up" data-aos-easing="linear" data-aos-duration="1000">Your success is our mission. As business advisors, we offer expert guidance, unlocking your potential for growth and profitability.</p>
          </div>

          {/* Contact Form */}
          <div className="md:w-1/2 md:mx-5">
            <form ref={form} onSubmit={handleSubmit(onSubmit)}>
              <div className="md:flex gap-x-4 mb-3">
                <div className="form-control md:w-1/2 mb-3 md:mb-0">
                  <label className="label mb-1">
                    <span className="label-text text-[#6F5D5B] font-dmSans">Full Name</span>
                  </label>
                  <input type="text" {...register("name", { required: true })} name="name" placeholder="Your Full Name" className="input placeholder:text-[14px] placeholder:text-[#6F5D5B] pl-3 font-semibold font-dmSans border border-[#e5d8d7b2]" />
                  {errors.name && <span className='text-[14px] text-rose-600'>Name is required</span>}
                </div>

                <div className="form-control md:w-1/2">
                  <label className="label mb-1">
                    <span className="label-text text-[#6F5D5B] font-dmSans">Email</span>
                  </label>
                  <input type="email" {...register("email", { required: true })} name="email" placeholder="Example@Venture.Com" className="input placeholder:text-[14px] placeholder:text-[#6F5D5B] pl-3 font-semibold font-dmSans border border-[#e5d8d7b2]" />
                  {errors.email && <span className='text-[14px] text-rose-600'>Email is required</span>}
                </div>
              </div>

              <div className="form-control mb-3">
                <label className="label mb-1">
                  <span className="label-text text-[#6F5D5B] font-dmSans">Subject</span>
                </label>
                <input type="text" {...register("subject", { required: true })} name="subject" placeholder="Example@Venture.Com" className="input placeholder:text-[14px] placeholder:text-[#6F5D5B] pl-3 font-semibold font-dmSans border border-[#e5d8d7b2]" />
                {errors.subject && <span className='text-[14px] text-rose-600'>Subject is required</span>}
              </div>

              <label className="form-control">
                <div className="label mb-1">
                  <span className="label-text text-[#6F5D5B] font-dmSans">Message</span>
                </div>
                <textarea  {...register("message", { required: true })} name="message" className="textarea h-36 placeholder:text-[14px] placeholder:text-[#6F5D5B] pl-3 font-semibold font-dmSans border border-[#e5d8d7b2]" placeholder="Text Here..."></textarea>
                {errors.message && <span className='text-[14px] text-rose-600'>Message is required</span>}
              </label>

              <div className="form-control mt-6">
                <input type="submit" value="Send Message" className="bg-[#9B0801] hover:bg-[#9b0901d8] text-white text-[15px] font-dmSans px-8 py-3 rounded-md w-[150px] flex justify-center cursor-pointer duration-200" />
              </div>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ContactUs;

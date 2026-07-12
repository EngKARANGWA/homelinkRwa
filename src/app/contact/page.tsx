"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const CONTACT_DETAILS = [
  {
    icon: Mail,
    label: "Email",
    value: "info@homelinkrwanda.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+250 7XX XXX XXX",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "Kigali, Rwanda",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon – Fri, 8:00 – 17:00",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-navy py-20">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Get in touch
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl">
              We&apos;d love to <span className="text-gold">hear from you.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
              Have a question, need a demo, or want help managing your
              properties? Reach out and our team will get back to you.
            </p>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-5 lg:px-10">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-navy">Contact details</h2>
              <p className="mt-2 text-sm text-slate-500">
                Prefer to reach out directly? Here&apos;s where to find us.
              </p>

              <div className="mt-8 flex flex-col gap-5">
                {CONTACT_DETAILS.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/15">
                      <Icon className="h-5 w-5 text-gold" strokeWidth={2} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-navy">
                        {label}
                      </p>
                      <p className="text-sm text-slate-500">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 lg:col-span-3">
              {submitted ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                  <p className="text-lg font-semibold text-navy">
                    Message sent!
                  </p>
                  <p className="text-sm text-slate-500">
                    Thanks for reaching out — our team will get back to you
                    shortly.
                  </p>
                </div>
              ) : (
                <form
                  className="flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                      Full name
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jean Claude Uwimana"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                      Email address
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                    Subject
                    <input
                      type="text"
                      required
                      placeholder="How can we help?"
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                    Message
                    <textarea
                      required
                      rows={5}
                      placeholder="Tell us a bit more..."
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                    />
                  </label>

                  <button
                    type="submit"
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold/90"
                  >
                    Send Message
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

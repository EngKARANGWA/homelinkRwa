import { Mail, MapPin, Phone } from "lucide-react";

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
];

export function Contact() {
  return (
    <section id="contact" className="bg-navy/80 py-16">
      <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">
          Get in touch
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          Contact us
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/70">
          Have a question or want a demo? Reach out and our team will get
          back to you.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {CONTACT_DETAILS.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
                <Icon className="h-5 w-5 text-gold" strokeWidth={2} />
              </span>
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-sm text-white/70">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

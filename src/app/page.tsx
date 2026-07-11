import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Solutions } from "@/components/landing/Solutions";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TrustedPartner } from "@/components/landing/TrustedPartner";
import { StatsBar } from "@/components/landing/StatsBar";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Solutions />
        <WhyChooseUs />
        <HowItWorks />
        <TrustedPartner />
        <StatsBar />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

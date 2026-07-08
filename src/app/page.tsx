import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { Contact } from "@/components/landing/Contact";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <WhyChooseUs />
        <Contact />
      </main>
    </div>
  );
}

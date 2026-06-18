import Footer from "@/components/layout/footer";
import SearchSection from "@/components/features/search-section";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col max-w-[640px] mx-auto px-4 py-20 w-full justify-between bg-bg-primary text-text-primary">
      <main className="grow w-full flex flex-col">
        {/* Hero Banner Area */}
        <section className="mt-6 mb-2">
          <h1 className="text-[1.8rem] font-semibold text-text-primary tracking-tight leading-tight mb-2">
            Explorations
          </h1>
          <p className="text-[0.95rem] text-text-secondary leading-relaxed">
            A collection of deep dives, code templates, and technical reflections on integrating Generative AI into web workflows.
          </p>
        </section>

        {/* Stateful Search and List Feature Component */}
        <SearchSection />
      </main>

      {/* Footer Layout Component */}
      <Footer />
    </div>
  );
}

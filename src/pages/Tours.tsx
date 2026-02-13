import { useState } from "react";
import { motion } from "framer-motion";
import { tours, categories } from "@/data/tours";
import TourCard from "@/components/TourCard";
import masaiMara from "@/assets/masai-mara.jpg";

export default function Tours() {
  const [active, setActive] = useState("all");
  const filtered = active === "all" ? tours : tours.filter((t) => t.category === active);

  return (
    <main>
      {/* Hero */}
      <section className="relative h-[45vh] min-h-[350px] flex items-center">
        <img src={masaiMara} alt="Masai Mara landscape" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 safari-overlay-strong" />
        <div className="relative container pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">Explore Kenya</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground">Tours & Safaris</h1>
            <p className="text-primary-foreground/80 mt-3 max-w-lg">
              From wildlife safaris to beach getaways, find the perfect Kenyan adventure.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="py-16">
        <div className="container">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  active === c.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((tour, i) => (
              <TourCard key={tour.id} tour={tour} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No tours found in this category.</p>
          )}
        </div>
      </section>
    </main>
  );
}

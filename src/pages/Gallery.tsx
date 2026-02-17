import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import heroSafari from "@/assets/hero-safari.jpg";
import masaiMara from "@/assets/masai-mara.jpg";
import beachHoliday from "@/assets/beach-holiday.jpg";
import culturalTour from "@/assets/cultural-tour.jpg";

import safariLodge from "@/assets/safari-lodge.jpg";
import mountKenya from "@/assets/mount-kenya.jpg";
import safariJeep from "@/assets/safari-jeep.jpg";

const images = [
  { src: heroSafari, alt: "Elephants at sunset in the savanna", category: "Wildlife" },
  { src: masaiMara, alt: "Aerial view of Masai Mara plains", category: "Landscape" },
  
  { src: beachHoliday, alt: "Tropical beach paradise", category: "Beach" },
  { src: culturalTour, alt: "Maasai cultural experience", category: "Culture" },
  { src: safariLodge, alt: "Luxury safari lodge at sunset", category: "Accommodation" },
  { src: mountKenya, alt: "Mount Kenya at sunrise", category: "Adventure" },
  { src: safariJeep, alt: "Safari jeep on game drive", category: "Safari" },
];

export default function Gallery() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <main>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center">
        <img src={heroSafari} alt="Wildlife" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 safari-overlay-strong" />
        <div className="relative container pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">Our Gallery</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground">Kenya Through Our Lens</h1>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`cursor-pointer overflow-hidden rounded-lg group ${i === 0 ? "sm:col-span-2 sm:row-span-2" : ""}`}
                onClick={() => setSelected(i)}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full min-h-[200px] object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-safari-dark/95 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <button className="absolute top-6 right-6 text-primary-foreground" onClick={() => setSelected(null)}>
              <X className="w-8 h-8" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={images[selected].src}
              alt={images[selected].alt}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { Tour } from "@/data/tours";
import { motion } from "framer-motion";
import { useCurrency } from "@/contexts/CurrencyContext";

import masaiMara from "@/assets/masai-mara.jpg";
import beachHoliday from "@/assets/beach-holiday.jpg";
import culturalTour from "@/assets/cultural-tour.jpg";
import mountKenya from "@/assets/mount-kenya.jpg";
import safariJeep from "@/assets/safari-jeep.jpg";
import safariLodge from "@/assets/safari-lodge.jpg";

const imageMap: Record<string, string> = {
  "masai-mara": masaiMara,
  "beach-holiday": beachHoliday,
  "cultural-tour": culturalTour,
  "mount-kenya": mountKenya,
  "safari-jeep": safariJeep,
  "safari-lodge": safariLodge,
};

export default function TourCard({ tour, index = 0 }: { tour: Tour; index?: number }) {
  const { format } = useCurrency();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        to={`/tours/${tour.id}`}
        className="group block bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
      >
        <div className="relative h-56 overflow-hidden">
          <img
            src={imageMap[tour.image]}
            alt={tour.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full capitalize">
            {tour.category}
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-heading text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
            {tour.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{tour.shortDescription}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {tour.duration}
              </span>
            </div>
            <span className="text-primary font-semibold text-sm">From {format(tour.priceKSH)}</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View Details <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

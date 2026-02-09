import { motion } from "framer-motion";
import { Instagram as InstagramIcon } from "lucide-react";

const images = [
  "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&q=80",
  "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400&q=80",
  "https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=400&q=80",
  "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400&q=80",
  "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400&q=80",
  "https://images.unsplash.com/photo-1543934638-bd2e138430c4?w=400&q=80",
];

const Instagram = () => (
  <section data-testid="instagram-section" className="py-16 bg-giftyne-muted/30">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
      <span className="font-accent text-lg text-giftyne-sage inline-block mb-1">
        follow the magic
      </span>
      <h2 className="font-heading text-3xl md:text-4xl font-bold text-giftyne-text tracking-tight mb-2">
        @giftyne
      </h2>
      <p className="font-body text-xs text-giftyne-text/40">Join our community on Instagram</p>
    </div>
    <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 md:gap-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {images.map((src, i) => (
        <motion.a
          key={i}
          href="#"
          data-testid={`instagram-img-${i}`}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
        >
          <img
            src={src}
            alt="Instagram post"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-giftyne-terra/0 group-hover:bg-giftyne-terra/30 transition-colors duration-300 flex items-center justify-center">
            <InstagramIcon
              size={24}
              className="text-white opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300"
            />
          </div>
        </motion.a>
      ))}
    </div>
  </section>
);

export default Instagram;

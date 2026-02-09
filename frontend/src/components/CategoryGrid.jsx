import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const categories = [
  {
    id: 1,
    name: "Gift Wrapping Paper",
    count: "12 Products",
    image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=700&q=80",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    id: 2,
    name: "Crochet Flowers",
    count: "7 Products",
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=500&q=80",
    span: "",
  },
  {
    id: 3,
    name: "Crochet Bouquets",
    count: "8 Products",
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=500&q=80",
    span: "",
  },
  {
    id: 4,
    name: "Crochet Soft Toys",
    count: "11 Products",
    image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=500&q=80",
    span: "",
  },
  {
    id: 5,
    name: "Crochet Bags",
    count: "Coming Soon",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80",
    span: "",
  },
  {
    id: 6,
    name: "Crochet Keychains",
    count: "16 Products",
    image: "https://images.unsplash.com/photo-1543934638-bd2e138430c4?w=500&q=80",
    span: "md:col-span-2",
  },
];

const CategoryGrid = () => {
  return (
    <section id="categories" data-testid="categories-section" className="py-20 lg:py-28 bg-giftyne-muted/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="font-accent text-lg text-giftyne-sage inline-block mb-1">
            explore our world
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-giftyne-text tracking-tight">
            Shop by Category
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[220px]">
          {categories.map((cat, i) => (
            <motion.a
              key={cat.id}
              href="#"
              data-testid={`category-card-${cat.id}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer ${cat.span}`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent group-hover:from-black/80 transition-all duration-500" />

              {/* Arrow icon on hover */}
              <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                <ArrowUpRight size={14} className="text-white" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                <p className="font-body text-[10px] text-white/50 uppercase tracking-wider mb-0.5">
                  {cat.count}
                </p>
                <h3 className="font-heading text-base md:text-lg font-semibold text-white leading-snug">
                  {cat.name}
                </h3>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;

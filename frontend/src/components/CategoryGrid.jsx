import { motion } from "framer-motion";

const categories = [
  {
    id: 1,
    name: "Gift Wrapping Paper",
    description: "Vibrant, hand-illustrated designs for every occasion",
    image: "https://giftyne.com/wp-content/uploads/2025/08/Frame-37528-1.jpeg",
    span: "lg:col-span-2 lg:row-span-2",
    aspect: "aspect-square lg:aspect-auto lg:h-full",
  },
  {
    id: 2,
    name: "Crochet Flowers",
    description: "Handmade blooms that last forever",
    image: "https://giftyne.com/wp-content/uploads/2025/08/Frame-37530-1.jpeg",
    span: "",
    aspect: "aspect-square",
  },
  {
    id: 3,
    name: "Crochet Bouquets",
    description: "Beautiful arrangements for every celebration",
    image: "https://giftyne.com/wp-content/uploads/2025/08/Frame-37531-1.jpeg",
    span: "",
    aspect: "aspect-square",
  },
  {
    id: 4,
    name: "Crochet Soft Toys",
    description: "Cuddly companions, handmade with care",
    image: "https://giftyne.com/wp-content/uploads/2025/08/Frame-37519.jpeg",
    span: "",
    aspect: "aspect-square",
  },
  {
    id: 5,
    name: "Crochet Bags",
    description: "Stylish & sustainable handcrafted bags",
    image: "https://giftyne.com/wp-content/uploads/2025/08/Frame-37525.jpeg",
    span: "",
    aspect: "aspect-square",
  },
  {
    id: 6,
    name: "Crochet Keychains",
    description: "Tiny treasures, big smiles",
    image: "https://giftyne.com/wp-content/uploads/2025/08/Frame-37526.jpeg",
    span: "lg:col-span-2",
    aspect: "aspect-square lg:aspect-[2/1]",
  },
];

const CategoryGrid = () => {
  return (
    <section id="categories" data-testid="categories-section" className="py-24 bg-giftyne-muted/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="font-accent text-lg text-giftyne-sage -rotate-2 inline-block mb-2">
            explore our world
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-semibold text-giftyne-text tracking-tight">
            Shop by Category
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 auto-rows-auto">
          {categories.map((cat, i) => (
            <motion.a
              key={cat.id}
              href="#"
              data-testid={`category-card-${cat.id}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer ${cat.span} ${cat.aspect}`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <h3 className="font-heading text-lg md:text-xl font-semibold text-white leading-snug mb-1">
                  {cat.name}
                </h3>
                <p className="font-body text-xs md:text-sm text-white/70 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  {cat.description}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;

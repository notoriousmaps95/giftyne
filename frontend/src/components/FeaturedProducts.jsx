import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Flower Gift Wrapping Paper",
    price: 499,
    image: "https://giftyne.com/wp-content/uploads/2025/08/Frame-37524.jpeg",
    tag: "Bestseller",
  },
  {
    id: 2,
    name: "Stripes Gift Wrapping Paper",
    price: 499,
    image: "https://giftyne.com/wp-content/uploads/2025/08/Frame-37525.jpeg",
    tag: "New",
  },
  {
    id: 3,
    name: "Polka Dot Wrapping Paper",
    price: 499,
    image: "https://giftyne.com/wp-content/uploads/2025/08/Frame-37526.jpeg",
    tag: null,
  },
  {
    id: 4,
    name: "Marble Gift Wrapping Paper",
    price: 499,
    image: "https://giftyne.com/wp-content/uploads/2025/08/Frame-37527.jpeg",
    tag: "Popular",
  },
];

const ProductCard = ({ product, index }) => (
  <motion.div
    data-testid={`product-card-${product.id}`}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="group relative bg-white rounded-2xl overflow-hidden"
    style={{ boxShadow: "0 4px 20px -2px rgba(198, 108, 73, 0.08)" }}
  >
    {product.tag && (
      <span className="absolute top-4 left-4 z-10 bg-giftyne-terra text-white font-body text-[11px] font-semibold px-3 py-1 rounded-full">
        {product.tag}
      </span>
    )}
    <button
      data-testid={`wishlist-btn-${product.id}`}
      className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-giftyne-terra hover:text-white text-giftyne-text/40"
    >
      <Heart size={14} />
    </button>
    <div className="aspect-[4/5] overflow-hidden bg-giftyne-muted">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
      />
    </div>
    <div className="p-5">
      <h3 className="font-heading text-base font-semibold text-giftyne-text leading-snug mb-2">
        {product.name}
      </h3>
      <div className="flex items-center justify-between">
        <p className="font-body text-lg font-bold text-giftyne-terra">
          &#8377;{product.price}
        </p>
        <button
          data-testid={`add-to-cart-${product.id}`}
          className="font-body text-xs font-semibold text-giftyne-sage border border-giftyne-sage/40 px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-giftyne-sage hover:text-white"
        >
          Add to Cart
        </button>
      </div>
    </div>
  </motion.div>
);

const FeaturedProducts = () => {
  return (
    <section data-testid="featured-products-section" className="py-24 bg-giftyne-bg relative">
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-14 gap-4">
          <div>
            <span className="font-accent text-lg text-giftyne-sage -rotate-2 inline-block mb-2">
              curated for you
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-semibold text-giftyne-text tracking-tight">
              Bestsellers
            </h2>
          </div>
          <a
            href="#"
            data-testid="view-all-products-btn"
            className="font-body text-sm font-medium text-giftyne-terra hover:underline underline-offset-4 transition-all"
          >
            View All Products &rarr;
          </a>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;

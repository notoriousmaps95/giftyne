import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";

const products = [
  {
    id: 1,
    name: "Floral Bloom Wrapping Paper",
    subtitle: "Pack of 5 sheets",
    price: 499,
    originalPrice: 699,
    image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=500&q=80",
    tag: "Bestseller",
    rating: 4.9,
    reviews: 124,
    stock: 8,
    slug: "flower-gift-wrapping-paper",
  },
  {
    id: 2,
    name: "Festive Stripes Gift Wrap",
    subtitle: "Pack of 5 sheets",
    price: 449,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=500&q=80",
    tag: "New",
    rating: 4.8,
    reviews: 56,
    stock: 15,
    slug: "stripes-gift-wrapping-paper",
  },
  {
    id: 3,
    name: "Crochet Rose Bouquet",
    subtitle: "Handmade",
    price: 1299,
    originalPrice: 1599,
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=500&q=80",
    tag: null,
    rating: 5.0,
    reviews: 89,
    stock: 3,
    slug: "crochet-rose-bouquet",
  },
  {
    id: 4,
    name: "Crochet Bunny Soft Toy",
    subtitle: "Handcrafted with love",
    price: 899,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=500&q=80",
    tag: "Popular",
    rating: 4.9,
    reviews: 201,
    stock: 5,
    slug: "big-ear-bunny",
  },
];

const ProductCard = ({ product, index }) => (
  <motion.div
    data-testid={`product-card-${product.id}`}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer"
    style={{ boxShadow: "0 2px 16px -2px rgba(198, 108, 73, 0.06)" }}
  >
    {product.stock <= 5 && (
      <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 bg-red-500/90 backdrop-blur-sm text-white font-body text-[9px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase">
        <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
        Only {product.stock} left
      </span>
    )}
    {product.tag && product.stock > 5 && (
      <span className={`absolute top-3 left-3 z-10 font-body text-[10px] font-bold px-3 py-1 rounded-full tracking-wide uppercase ${
        product.tag === "Bestseller" ? "bg-giftyne-terra text-white" :
        product.tag === "New" ? "bg-giftyne-sage text-white" :
        "bg-giftyne-text text-white"
      }`}>
        {product.tag}
      </span>
    )}
    <button
      data-testid={`wishlist-btn-${product.id}`}
      className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-giftyne-terra hover:text-white text-giftyne-text/30 shadow-sm"
    >
      <Heart size={14} />
    </button>
    <div className="aspect-[3/4] overflow-hidden bg-giftyne-muted relative">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
      />
      {/* Quick add overlay */}
      <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <button
          data-testid={`add-to-cart-${product.id}`}
          className="w-full flex items-center justify-center gap-2 bg-giftyne-text/90 backdrop-blur-sm text-white font-body text-xs font-semibold py-3 rounded-xl hover:bg-giftyne-terra transition-colors"
        >
          <ShoppingBag size={14} />
          Quick Add
        </button>
      </div>
    </div>
    <div className="p-4">
      <div className="flex items-center gap-1 mb-1.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
        ))}
        <span className="font-body text-[10px] text-giftyne-text/40 ml-1">{product.rating}</span>
        <span className="font-body text-[10px] text-giftyne-text/25 ml-0.5">({product.reviews})</span>
      </div>
      <h3 className="font-heading text-sm font-semibold text-giftyne-text leading-snug mb-0.5">
        {product.name}
      </h3>
      <p className="font-body text-[11px] text-giftyne-text/40 mb-2">{product.subtitle}</p>
      <div className="flex items-center gap-2">
        <p className="font-body text-base font-bold text-giftyne-terra">
          &#8377;{product.price}
        </p>
        {product.originalPrice && (
          <p className="font-body text-xs text-giftyne-text/30 line-through">
            &#8377;{product.originalPrice}
          </p>
        )}
      </div>
    </div>
  </motion.div>
);

const FeaturedProducts = () => {
  return (
    <section data-testid="featured-products-section" className="py-20 lg:py-28 bg-giftyne-bg relative grain-overlay">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div>
            <span className="font-accent text-lg text-giftyne-sage inline-block mb-1">
              curated for you
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-giftyne-text tracking-tight">
              Bestsellers
            </h2>
          </div>
          <a
            href="#"
            data-testid="view-all-products-btn"
            className="group font-body text-xs font-semibold text-giftyne-terra tracking-wide uppercase flex items-center gap-1 hover:gap-2 transition-all"
          >
            View All
            <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </a>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;

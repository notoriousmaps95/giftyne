import { motion } from "framer-motion";
import { Star, Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const RelatedProducts = ({ products }) => {
  if (!products.length) return null;

  return (
    <section data-testid="related-products-section" className="mt-20 md:mt-28">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="font-accent text-base text-giftyne-sage inline-block mb-1">you may also like</span>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-giftyne-text tracking-tight">
            Related Products
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product, i) => (
          <motion.div
            key={product.slug}
            data-testid={`related-product-${i}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Link
              to={`/product/${product.slug}`}
              className="group block bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 2px 16px -2px rgba(198, 108, 73, 0.06)" }}
            >
              {product.stock <= 5 && (
                <div className="relative">
                  <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 bg-red-500/90 text-white font-body text-[9px] font-bold px-2.5 py-1 rounded-full uppercase">
                    <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                    Only {product.stock} left
                  </span>
                </div>
              )}
              {product.originalPrice && (
                <div className="relative">
                  <span className="absolute top-3 right-3 z-10 bg-green-500 text-white font-body text-[9px] font-bold px-2 py-0.5 rounded-full">
                    SALE
                  </span>
                </div>
              )}
              <div className="aspect-square overflow-hidden bg-giftyne-muted">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="p-4">
                <p className="font-body text-[10px] text-giftyne-text/30 uppercase tracking-wider mb-1">{product.category}</p>
                <h3 className="font-heading text-sm font-semibold text-giftyne-text leading-snug mb-1.5">{product.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={10} className={j < Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "fill-giftyne-sand text-giftyne-sand"} />
                  ))}
                  <span className="font-body text-[10px] text-giftyne-text/35 ml-0.5">({product.reviews})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-body text-base font-bold text-giftyne-terra">&#8377;{product.price.toLocaleString("en-IN")}</span>
                  {product.originalPrice && (
                    <span className="font-body text-xs text-giftyne-text/25 line-through">&#8377;{product.originalPrice.toLocaleString("en-IN")}</span>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Heart, ShoppingBag, Minus, Plus, Shield, Truck, RotateCcw, Share2, Check } from "lucide-react";

const ProductInfo = ({ product }) => {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div data-testid="product-info" className="flex flex-col">
      {/* Breadcrumb */}
      <nav data-testid="breadcrumb" className="flex items-center gap-2 font-body text-xs text-giftyne-text/40 mb-4">
        <a href="/" className="hover:text-giftyne-terra transition-colors">Home</a>
        <span>/</span>
        <a href="/" className="hover:text-giftyne-terra transition-colors">{product.category}</a>
        <span>/</span>
        <span className="text-giftyne-text/60">{product.name}</span>
      </nav>

      {/* Title & Rating */}
      <h1 data-testid="product-title" className="font-heading text-2xl md:text-3xl font-bold text-giftyne-text tracking-tight mb-3">
        {product.name}
      </h1>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "fill-giftyne-sand text-giftyne-sand"}
            />
          ))}
        </div>
        <span className="font-body text-sm font-semibold text-giftyne-text">{product.rating}</span>
        <span className="font-body text-xs text-giftyne-text/35">({product.reviews} reviews)</span>
        {product.stock <= 5 && (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-500 font-body text-[10px] font-semibold px-2.5 py-1 rounded-full">
            <span className="w-1 h-1 bg-red-400 rounded-full animate-pulse" />
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* Price */}
      <div data-testid="product-price" className="flex items-baseline gap-3 mb-5">
        <span className="font-heading text-3xl font-bold text-giftyne-terra">&#8377;{product.price.toLocaleString("en-IN")}</span>
        {product.originalPrice && (
          <>
            <span className="font-body text-lg text-giftyne-text/30 line-through">&#8377;{product.originalPrice.toLocaleString("en-IN")}</span>
            <span className="font-body text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{discount}% OFF</span>
          </>
        )}
      </div>
      <p className="font-body text-xs text-giftyne-text/30 -mt-3 mb-5">Inclusive of all taxes. Shipping calculated at checkout.</p>

      {/* Short description */}
      <p data-testid="product-short-desc" className="font-body text-sm text-giftyne-text/55 leading-relaxed mb-6">
        {product.shortDescription}
      </p>

      {/* Variants */}
      {product.variants.length > 1 && (
        <div data-testid="variant-selector" className="mb-6">
          <p className="font-body text-xs font-semibold text-giftyne-text/70 uppercase tracking-wider mb-3">
            Variant: <span className="text-giftyne-terra normal-case tracking-normal">{product.variants[selectedVariant].name}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v, i) => (
              <button
                key={v.name}
                data-testid={`variant-btn-${i}`}
                onClick={() => setSelectedVariant(i)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                  selectedVariant === i
                    ? "border-giftyne-terra bg-giftyne-terra/5"
                    : "border-giftyne-sand/40 hover:border-giftyne-sand"
                }`}
              >
                <span className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: v.color }} />
                <span className="font-body text-xs font-medium text-giftyne-text">{v.name}</span>
                {selectedVariant === i && <Check size={12} className="text-giftyne-terra" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div data-testid="quantity-selector" className="mb-6">
        <p className="font-body text-xs font-semibold text-giftyne-text/70 uppercase tracking-wider mb-3">Quantity</p>
        <div className="inline-flex items-center border border-giftyne-sand/50 rounded-xl overflow-hidden">
          <button
            data-testid="qty-minus-btn"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-11 h-11 flex items-center justify-center hover:bg-giftyne-muted transition-colors text-giftyne-text/50"
          >
            <Minus size={16} />
          </button>
          <span data-testid="qty-value" className="w-12 h-11 flex items-center justify-center font-body text-sm font-semibold text-giftyne-text border-x border-giftyne-sand/50">
            {quantity}
          </span>
          <button
            data-testid="qty-plus-btn"
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="w-11 h-11 flex items-center justify-center hover:bg-giftyne-muted transition-colors text-giftyne-text/50"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <motion.button
          data-testid="add-to-cart-btn"
          onClick={handleAddToCart}
          whileTap={{ scale: 0.97 }}
          className={`flex-1 flex items-center justify-center gap-2 font-body text-sm font-semibold py-4 rounded-full transition-all duration-300 ${
            addedToCart
              ? "bg-green-500 text-white"
              : "bg-giftyne-terra text-white hover:bg-giftyne-terra/90 hover:shadow-lg hover:shadow-giftyne-terra/20"
          }`}
        >
          {addedToCart ? (
            <>
              <Check size={18} />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingBag size={18} />
              Add to Cart &mdash; &#8377;{(product.price * quantity).toLocaleString("en-IN")}
            </>
          )}
        </motion.button>
        <button
          data-testid="wishlist-btn"
          onClick={() => setWishlisted(!wishlisted)}
          className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            wishlisted
              ? "border-red-400 bg-red-50 text-red-500"
              : "border-giftyne-sand/50 text-giftyne-text/30 hover:border-giftyne-terra hover:text-giftyne-terra"
          }`}
        >
          <Heart size={20} className={wishlisted ? "fill-red-500" : ""} />
        </button>
        <button
          data-testid="share-btn"
          className="w-14 h-14 rounded-full border-2 border-giftyne-sand/50 flex items-center justify-center text-giftyne-text/30 hover:border-giftyne-terra hover:text-giftyne-terra transition-all"
        >
          <Share2 size={18} />
        </button>
      </div>

      {/* Trust signals */}
      <div data-testid="product-trust-signals" className="grid grid-cols-3 gap-3 p-4 bg-giftyne-muted/50 rounded-xl border border-giftyne-sand/20">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <Shield size={18} className="text-giftyne-sage" strokeWidth={1.5} />
          <span className="font-body text-[10px] font-medium text-giftyne-text/50">Secure<br />Checkout</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <Truck size={18} className="text-giftyne-sage" strokeWidth={1.5} />
          <span className="font-body text-[10px] font-medium text-giftyne-text/50">Free Shipping<br />above &#8377;999</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <RotateCcw size={18} className="text-giftyne-sage" strokeWidth={1.5} />
          <span className="font-body text-[10px] font-medium text-giftyne-text/50">7-Day Easy<br />Returns</span>
        </div>
      </div>

      {/* SKU */}
      <p className="font-body text-[11px] text-giftyne-text/25 mt-4">
        SKU: {product.sku} &middot; Category: {product.category}
      </p>
    </div>
  );
};

export default ProductInfo;

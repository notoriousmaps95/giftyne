import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    { id: "description", label: "Description" },
    { id: "specs", label: "Specifications" },
    { id: "reviews", label: `Reviews (${product.reviews})` },
  ];

  return (
    <div data-testid="product-tabs" className="mt-16 md:mt-24">
      {/* Tab headers */}
      <div className="flex gap-1 border-b border-giftyne-sand/40 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-testid={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`font-body text-sm font-medium px-5 py-3 relative transition-colors ${
              activeTab === tab.id ? "text-giftyne-terra" : "text-giftyne-text/40 hover:text-giftyne-text/60"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-giftyne-terra rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "description" && (
          <div data-testid="tab-content-description" className="max-w-3xl space-y-8">
            {product.description.map((section, i) => (
              <div key={i}>
                <h3 className="font-heading text-xl font-semibold text-giftyne-text mb-3">{section.title}</h3>
                <p className="font-body text-sm text-giftyne-text/55 leading-relaxed whitespace-pre-line">{section.content}</p>
              </div>
            ))}

            {/* Features */}
            <div>
              <h3 className="font-heading text-xl font-semibold text-giftyne-text mb-3">Key Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-giftyne-sage/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="text-giftyne-sage" />
                    </div>
                    <span className="font-body text-sm text-giftyne-text/55">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Occasions */}
            <div>
              <h3 className="font-heading text-xl font-semibold text-giftyne-text mb-3">Perfect For</h3>
              <div className="flex flex-wrap gap-2">
                {product.occasions.map((o) => (
                  <span key={o} className="font-body text-xs font-medium text-giftyne-terra bg-giftyne-terra/5 border border-giftyne-terra/10 px-3.5 py-1.5 rounded-full">
                    {o}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "specs" && (
          <div data-testid="tab-content-specs" className="max-w-xl">
            <div className="border border-giftyne-sand/30 rounded-xl overflow-hidden">
              {Object.entries(product.specs).map(([key, value], i) => (
                <div
                  key={key}
                  className={`flex items-center py-3.5 px-5 ${i % 2 === 0 ? "bg-giftyne-muted/30" : "bg-white"}`}
                >
                  <span className="font-body text-xs font-semibold text-giftyne-text/60 w-40 shrink-0">{key}</span>
                  <span className="font-body text-sm text-giftyne-text/80">{value}</span>
                </div>
              ))}
            </div>
            {product.variants.length > 1 && (
              <div className="mt-4 border border-giftyne-sand/30 rounded-xl overflow-hidden">
                <div className="flex items-center py-3.5 px-5 bg-giftyne-muted/30">
                  <span className="font-body text-xs font-semibold text-giftyne-text/60 w-40 shrink-0">Variants</span>
                  <span className="font-body text-sm text-giftyne-text/80">
                    {product.variants.map((v) => v.name).join(", ")}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div data-testid="tab-content-reviews" className="max-w-2xl">
            {/* Rating summary */}
            <div className="flex items-center gap-8 mb-8 p-6 bg-giftyne-muted/30 rounded-xl border border-giftyne-sand/20">
              <div className="text-center">
                <p className="font-heading text-4xl font-bold text-giftyne-text">{product.rating}</p>
                <div className="flex gap-0.5 mt-1 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < Math.round(product.rating) ? "#F59E0B" : "#E6D5B8"} stroke="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="font-body text-xs text-giftyne-text/35 mt-1">{product.reviews} reviews</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const pct = star === 5 ? 78 : star === 4 ? 15 : star === 3 ? 5 : star === 2 ? 1 : 1;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="font-body text-[11px] text-giftyne-text/40 w-3">{star}</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <div className="flex-1 h-1.5 bg-giftyne-sand/30 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-body text-[11px] text-giftyne-text/30 w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sample reviews */}
            <div className="space-y-5">
              {[
                { name: "Priya S.", date: "Jan 2026", rating: 5, text: "Absolutely love the quality! The chain pattern is so elegant and the paper folds beautifully. Ordered for Diwali gifts and everyone loved the wrapping." },
                { name: "Ananya G.", date: "Dec 2025", rating: 5, text: "The golden variant looks so premium. Paper quality is great, doesn't tear easily. Will order again for sure!" },
                { name: "Ritu M.", date: "Nov 2025", rating: 4, text: "Good quality wrapping paper. The design is subtle yet classy. Only wish they had more size options." },
              ].map((review, i) => (
                <div key={i} data-testid={`review-${i}`} className="bg-white p-5 rounded-xl border border-giftyne-sand/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-giftyne-sage/10 rounded-full flex items-center justify-center">
                        <span className="font-heading text-xs font-bold text-giftyne-sage">{review.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-body text-xs font-semibold text-giftyne-text">{review.name}</p>
                        <p className="font-body text-[10px] text-giftyne-text/30">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-flex items-center gap-1 text-[9px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <Check size={9} /> Verified
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(review.rating)].map((_, j) => (
                      <svg key={j} width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="font-body text-sm text-giftyne-text/55 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProductTabs;

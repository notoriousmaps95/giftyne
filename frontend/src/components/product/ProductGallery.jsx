import { useState } from "react";
import { motion } from "framer-motion";
import { ZoomIn } from "lucide-react";

const ProductGallery = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  return (
    <div data-testid="product-gallery" className="flex flex-col-reverse md:flex-row gap-3">
      {/* Thumbnails */}
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[520px] pb-1 md:pb-0 md:pr-1">
        {images.map((img, i) => (
          <button
            key={i}
            data-testid={`gallery-thumb-${i}`}
            onClick={() => setActiveIndex(i)}
            className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
              activeIndex === i ? "border-giftyne-terra shadow-md" : "border-giftyne-sand/40 hover:border-giftyne-sand"
            }`}
          >
            <img src={img} alt={`${productName} ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="flex-1 relative group">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl overflow-hidden bg-giftyne-muted aspect-square md:aspect-[4/5] cursor-zoom-in relative"
          onClick={() => setZoomed(true)}
        >
          <img
            src={images[activeIndex]}
            alt={productName}
            data-testid="gallery-main-image"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
            <div className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn size={18} className="text-giftyne-text" />
            </div>
          </div>
        </motion.div>

        {/* Zoom modal */}
        {zoomed && (
          <div
            data-testid="zoom-modal"
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setZoomed(false)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={images[activeIndex]}
              alt={productName}
              className="max-w-full max-h-[90vh] object-contain rounded-xl"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;

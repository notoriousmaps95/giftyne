import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { getProduct, getRelatedProducts } from "@/data/products";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductTabs from "@/components/product/ProductTabs";
import RelatedProducts from "@/components/product/RelatedProducts";

const ProductPage = () => {
  const { slug } = useParams();
  const product = getProduct(slug);
  const relatedProducts = getRelatedProducts(slug, 4);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!product) {
    return (
      <div data-testid="product-not-found" className="min-h-screen bg-giftyne-bg flex flex-col items-center justify-center px-4">
        <h1 className="font-heading text-4xl font-bold text-giftyne-text mb-4">Product Not Found</h1>
        <p className="font-body text-base text-giftyne-text/50 mb-8">The product you are looking for doesn&apos;t exist or has been removed.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-giftyne-terra text-white font-body font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-giftyne-terra/90 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div data-testid="product-page" className="min-h-screen bg-giftyne-bg">
      {/* Simple top bar */}
      <div className="bg-giftyne-bg border-b border-giftyne-sand/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" data-testid="back-to-home" className="flex items-center gap-2 font-body text-xs font-medium text-giftyne-text/50 hover:text-giftyne-terra transition-colors">
            <ArrowLeft size={14} />
            Back to Shop
          </Link>
          <Link to="/" className="font-heading text-2xl font-bold text-giftyne-text tracking-tight">
            Giftyne
          </Link>
          <div className="w-20" />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          <ProductGallery images={product.images} productName={product.name} />
          <ProductInfo product={product} />
        </div>

        <ProductTabs product={product} />
        <RelatedProducts products={relatedProducts} />
      </div>

      {/* Simple footer */}
      <div className="mt-20 bg-giftyne-text py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-body text-xs text-white/25">
            &copy; {new Date().getFullYear()} Giftyne. All rights reserved. Made with love in India.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;

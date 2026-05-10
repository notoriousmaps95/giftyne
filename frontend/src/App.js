import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Marquee from "@/components/Marquee";
import FeaturedProducts from "@/components/FeaturedProducts";
import FeaturedCollection from "@/components/FeaturedCollection";
import CategoryGrid from "@/components/CategoryGrid";
import HowItWorks from "@/components/HowItWorks";
import WhyGiftyne from "@/components/WhyGiftyne";
import CredibilityStats from "@/components/CredibilityStats";
import Testimonials from "@/components/Testimonials";
import Instagram from "@/components/Instagram";
import Footer from "@/components/Footer";
import LiveNotification from "@/components/LiveNotification";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProductPage from "@/components/ProductPage";
import FinancialPlanner from "@/components/planner/FinancialPlanner";

const Home = () => {
  return (
    <div data-testid="homepage" className="min-h-screen bg-giftyne-bg">
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <TrustBar />
      <Marquee />
      <FeaturedProducts />
      <FeaturedCollection />
      <CategoryGrid />
      <HowItWorks />
      <WhyGiftyne />
      <CredibilityStats />
      <Testimonials />
      <Instagram />
      <Footer />
      <LiveNotification />
      <WhatsAppButton />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/planner" element={<FinancialPlanner />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

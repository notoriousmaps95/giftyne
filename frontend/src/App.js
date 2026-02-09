import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import FeaturedProducts from "@/components/FeaturedProducts";
import FeaturedCollection from "@/components/FeaturedCollection";
import CategoryGrid from "@/components/CategoryGrid";
import HowItWorks from "@/components/HowItWorks";
import WhyGiftyne from "@/components/WhyGiftyne";
import Testimonials from "@/components/Testimonials";
import Instagram from "@/components/Instagram";
import Footer from "@/components/Footer";

const Home = () => {
  return (
    <div data-testid="homepage" className="min-h-screen bg-giftyne-bg">
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <Marquee />
      <FeaturedProducts />
      <FeaturedCollection />
      <CategoryGrid />
      <HowItWorks />
      <WhyGiftyne />
      <Testimonials />
      <Instagram />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

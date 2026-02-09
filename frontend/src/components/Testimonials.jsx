import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    text: "The wrapping papers are absolutely stunning! Every gift I wrapped became the center of attention. The quality and print are top-notch. My friends keep asking where I get them from!",
    rating: 5,
    location: "Mumbai",
    product: "Floral Bloom Wrapping Paper",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
  },
  {
    id: 2,
    name: "Ananya Gupta",
    text: "I ordered a crochet bouquet for my mom's birthday and she was beyond thrilled. The craftsmanship is incredible — you can tell every petal was made with love and care.",
    rating: 5,
    location: "Bangalore",
    product: "Crochet Rose Bouquet",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
  },
  {
    id: 3,
    name: "Ritu Mehta",
    text: "Giftyne's keychains are the cutest! I bought the capybara one for my friend and she hasn't stopped showing it off. The quality is amazing for the price. Will definitely order again!",
    rating: 5,
    location: "Delhi",
    product: "Capybara Keychain",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
  },
];

const Testimonials = () => {
  return (
    <section data-testid="testimonials-section" className="py-20 lg:py-28 bg-giftyne-bg relative grain-overlay">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <span className="font-accent text-lg text-giftyne-sage inline-block mb-1">
            love notes
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-giftyne-text tracking-tight">
            What Our Customers Say
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              data-testid={`testimonial-card-${t.id}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 relative border border-giftyne-sand/30 hover:shadow-lg hover:shadow-giftyne-terra/5 transition-all duration-300"
            >
              <Quote size={28} className="text-giftyne-terra/10 mb-3" strokeWidth={1.5} />

              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={12} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 font-body text-[9px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                  Verified Buyer
                </span>
              </div>

              <p className="font-body text-sm text-giftyne-text/60 leading-relaxed mb-5">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="pt-4 border-t border-giftyne-sand/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <p className="font-body text-sm font-semibold text-giftyne-text">{t.name}</p>
                    <p className="font-body text-[11px] text-giftyne-text/35">{t.location}</p>
                  </div>
                </div>
                <span className="font-body text-[10px] text-giftyne-terra/60 bg-giftyne-terra/5 px-2.5 py-1 rounded-full">
                  {t.product}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

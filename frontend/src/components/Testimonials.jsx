import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    text: "The wrapping papers are absolutely stunning! Every gift I wrapped became the center of attention. The quality and print are top-notch.",
    rating: 5,
    location: "Mumbai",
  },
  {
    id: 2,
    name: "Ananya Gupta",
    text: "I ordered a crochet bouquet for my mom's birthday and she was beyond thrilled. The craftsmanship is incredible — you can tell it's made with love!",
    rating: 5,
    location: "Bangalore",
  },
  {
    id: 3,
    name: "Ritu Mehta",
    text: "Giftyne's keychains are the cutest! I bought the capybara one for my friend and she hasn't stopped showing it off. Will definitely order again.",
    rating: 5,
    location: "Delhi",
  },
];

const Testimonials = () => {
  return (
    <section data-testid="testimonials-section" className="py-24 bg-giftyne-muted/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="font-accent text-lg text-giftyne-sage -rotate-2 inline-block mb-2">
            love letters
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-semibold text-giftyne-text tracking-tight">
            What Our Customers Say
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              data-testid={`testimonial-card-${t.id}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="bg-white rounded-2xl p-7 relative"
              style={{ boxShadow: "0 4px 20px -4px rgba(45, 42, 38, 0.06)" }}
            >
              {/* Quote mark */}
              <span className="font-heading text-6xl text-giftyne-terra/15 absolute top-4 right-6 leading-none">
                &ldquo;
              </span>

              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className="fill-giftyne-terra text-giftyne-terra"
                  />
                ))}
              </div>
              <p className="font-body text-sm text-giftyne-text/70 leading-relaxed mb-6 italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-giftyne-sage/20 flex items-center justify-center">
                  <span className="font-heading text-sm font-bold text-giftyne-sage">
                    {t.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-giftyne-text">{t.name}</p>
                  <p className="font-body text-xs text-giftyne-text/40">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

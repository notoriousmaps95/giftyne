const items = [
  "Gift Wrapping Paper",
  "Crochet Flowers",
  "Handmade Bouquets",
  "Crochet Soft Toys",
  "Crochet Keychains",
  "Eco-Friendly",
  "Made in India",
  "Custom Orders",
];

const Marquee = () => (
  <div data-testid="marquee-section" className="bg-giftyne-terra py-4 overflow-hidden">
    <div className="animate-marquee flex whitespace-nowrap">
      {[...items, ...items, ...items, ...items].map((item, i) => (
        <span key={i} className="inline-flex items-center mx-6 md:mx-10 font-heading text-sm md:text-base font-medium text-white/90 tracking-wide">
          <span className="w-1.5 h-1.5 bg-white/40 rounded-full mr-6 md:mr-10" />
          {item}
        </span>
      ))}
    </div>
  </div>
);

export default Marquee;

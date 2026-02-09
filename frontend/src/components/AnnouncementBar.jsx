import { Gift, Truck, Sparkles } from "lucide-react";

const items = [
  { icon: Sparkles, text: "Free shipping on orders above ₹999" },
  { icon: Gift, text: "Handcrafted with love in India" },
  { icon: Truck, text: "Dispatched within 48 hours" },
  { icon: Sparkles, text: "100% Eco-Friendly Packaging" },
  { icon: Gift, text: "Custom orders available" },
  { icon: Truck, text: "COD Available" },
];

const AnnouncementBar = () => (
  <div data-testid="announcement-bar" className="bg-giftyne-text text-white overflow-hidden relative z-[60]">
    <div className="animate-announcement flex whitespace-nowrap py-2">
      {[...items, ...items].map((item, i) => (
        <span key={i} className="inline-flex items-center gap-2 mx-8 font-body text-xs tracking-wide">
          <item.icon size={12} className="text-giftyne-terra" />
          {item.text}
        </span>
      ))}
    </div>
  </div>
);

export default AnnouncementBar;

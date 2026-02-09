import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";

const orders = [
  { name: "Priya", city: "Mumbai", product: "Floral Bloom Wrapping Paper", time: "2 mins ago" },
  { name: "Ananya", city: "Bangalore", product: "Crochet Rose Bouquet", time: "5 mins ago" },
  { name: "Ritu", city: "Delhi", product: "Capybara Keychain", time: "8 mins ago" },
  { name: "Sneha", city: "Pune", product: "Crochet Sunflower Bouquet", time: "12 mins ago" },
  { name: "Kavya", city: "Jaipur", product: "Big Ear Bunny Soft Toy", time: "15 mins ago" },
  { name: "Meera", city: "Chennai", product: "Stripes Gift Wrap (Pack of 5)", time: "18 mins ago" },
  { name: "Pooja", city: "Hyderabad", product: "Korean Sheet Wrapping Paper", time: "22 mins ago" },
];

const LiveNotification = () => {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const showTimer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(showTimer);
  }, [dismissed]);

  useEffect(() => {
    if (dismissed || !visible) return;
    const cycleTimer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % orders.length);
        setVisible(true);
      }, 800);
    }, 5000);
    return () => clearInterval(cycleTimer);
  }, [visible, dismissed]);

  if (dismissed) return null;

  const order = orders[current];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-testid="live-notification"
          initial={{ opacity: 0, y: 20, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-20 left-4 z-40 bg-white rounded-2xl shadow-2xl shadow-giftyne-text/10 border border-giftyne-sand/30 p-4 max-w-[300px] cursor-pointer group"
        >
          <button
            data-testid="dismiss-notification-btn"
            onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-giftyne-muted rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-giftyne-sand"
          >
            <X size={12} className="text-giftyne-text/60" />
          </button>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-giftyne-terra/10 flex items-center justify-center shrink-0">
              <ShoppingBag size={16} className="text-giftyne-terra" />
            </div>
            <div>
              <p className="font-body text-xs text-giftyne-text leading-relaxed">
                <span className="font-semibold">{order.name}</span> from{" "}
                <span className="font-semibold">{order.city}</span> just purchased
              </p>
              <p className="font-body text-xs font-semibold text-giftyne-terra mt-0.5">
                {order.product}
              </p>
              <p className="font-body text-[10px] text-giftyne-text/30 mt-1">{order.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="font-body text-[10px] text-giftyne-text/30">Verified purchase</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LiveNotification;

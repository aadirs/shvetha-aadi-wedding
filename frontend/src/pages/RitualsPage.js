import { useState } from "react";
import HeritageNav from "../components/HeritageNav";
import { Separator } from "../components/ui/separator";
import { ChevronDown } from "lucide-react";

/*
 * HOW TO UPDATE RITUALS:
 * 
 * Edit the 'rituals' array below. Each ritual has:
 * - title: Name of the ritual
 * - image: URL to an image (use temple manuscript style illustrations)
 * - description: Brief explanation of the ritual
 * - significance: Spiritual/cultural significance
 * 
 * Add, remove, or modify rituals as needed.
 */

const rituals = [
  {
    title: "Vratham",
    image: "https://images.unsplash.com/photo-1721786838752-aada8c94d732?w=600&q=80",
    description: "A day of prayers and preparation where the bride and groom observe fasting and seek blessings from the divine.",
    significance: "Purifies the mind and body, preparing the couple for the sacred union ahead."
  },
  {
    title: "Kasi Yatra",
    image: "/Kasi_Yatra.png",
    description: "The groom pretends to leave for Kasi (Varanasi) to become a sage, but is convinced by the bride's father to embrace married life instead.",
    significance: "Symbolizes the choice of Grihastha (householder) life over Sanyasa (renunciation)."
  },
  {
    title: "Oonjal",
    image: "/Oonjal.png",
    description: "The couple sits on a decorated swing while married women sing traditional songs and perform aarti.",
    significance: "The swinging represents life's ups and downs, teaching the couple to face them together with balance."
  },
  {
    title: "Kanyadanam",
    image: "/Kanyadanam.png",
    description: "The bride's father ceremonially gives his daughter's hand to the groom, with sacred water flowing through their joined hands.",
    significance: "Considered the highest form of danam (gift), symbolizing the parents' trust and blessings."
  },
  {
    title: "Mangalya Dharanam",
    image: "https://images.pexels.com/photos/7669966/pexels-photo-7669966.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "The groom ties the sacred Mangalyam (Thali) around the bride's neck with three knots.",
    significance: "The three knots represent commitment of mind, speech, and body. This is the defining moment of the wedding."
  },
  {
    title: "Sapthapadi",
    image: "https://images.pexels.com/photos/35355920/pexels-photo-35355920.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "The couple takes seven steps together around the sacred fire, each step representing a vow.",
    significance: "Seven vows for food, strength, prosperity, wisdom, progeny, health, and friendship."
  },
  {
    title: "Pradhana Homam",
    image: "https://images.unsplash.com/photo-1712339144667-02161a9106cd?w=600&q=80",
    description: "The main fire ceremony where offerings are made to Agni (fire god) with sacred mantras.",
    significance: "Agni serves as the divine witness to the marriage vows and carries prayers to the gods."
  },
  {
    title: "Ammi Midithal",
    image: "https://images.unsplash.com/photo-1576470134211-0323f4308598?w=600&q=80",
    description: "The bride places her foot on a grinding stone while the groom holds it.",
    significance: "Symbolizes steadfastness—like the stone, the bride should remain firm in her new home."
  },
  {
    title: "Arundhati Nakshatram",
    image: "https://images.pexels.com/photos/36053876/pexels-photo-36053876.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "The couple is shown the stars Arundhati and Vasishta in the night sky.",
    significance: "Arundhati and Vasishta are the ideal couple in Hindu mythology, representing eternal devotion."
  },
  {
    title: "Gruhapravesham",
    image: "https://images.pexels.com/photos/35441106/pexels-photo-35441106.jpeg?auto=compress&cs=tinysrgb&w=600",
    description: "The bride ceremonially enters her new home, welcomed with aarti and auspicious rituals.",
    significance: "Marks the beginning of the bride's new journey as she brings Lakshmi (prosperity) to her new home."
  }
];

export default function RitualsPage() {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen mandala-bg">
      <HeritageNav />
      
      {/* Hero Section - matching blessings page */}
      <header className="relative overflow-hidden bg-crimson text-white">
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='30' fill='none' stroke='%23D4AF37' stroke-width='0.5'/%3E%3Ccircle cx='40' cy='40' r='20' fill='none' stroke='%23D4AF37' stroke-width='0.3'/%3E%3Ccircle cx='40' cy='40' r='10' fill='none' stroke='%23D4AF37' stroke-width='0.3'/%3E%3C/svg%3E")`,
            }}
          />
        </div>
        
        <div className="relative z-10 max-w-2xl mx-auto text-center py-16 px-6 sm:py-20">
          <Separator className="mx-auto w-20 bg-gold/40 mb-6" />
          <p className="text-gold uppercase tracking-[0.3em] text-xs font-sans font-semibold mb-4">
            Vedic traditions
          </p>
          <h1 
            className="font-signature text-5xl sm:text-6xl lg:text-7xl text-white mb-4"
            data-testid="rituals-title"
          >
            Sacred Ceremonies
          </h1>
          <p className="text-champagne/80 font-serif italic text-base sm:text-lg">
            The ancient traditions of an Iyer Wedding
          </p>
        </div>
      </header>

      {/* Desktop Timeline */}
      <section className="hidden md:block py-16 px-6">
        <div className="max-w-5xl mx-auto relative">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gold/30" />

          {rituals.map((ritual, index) => (
            <div 
              key={index}
              className={`relative flex items-center mb-20 ${
                index % 2 === 0 ? "flex-row" : "flex-row-reverse"
              }`}
            >
              {/* Content */}
              <div 
                className={`w-5/12 ${index % 2 === 0 ? "pr-12 text-right" : "pl-12 text-left"}`}
              >
                <span 
                  className="inline-block px-3 py-1 text-xs tracking-wider uppercase rounded-full mb-3 bg-gold/20 text-gold font-semibold"
                >
                  Step {index + 1}
                </span>
                <h3 className="font-serif text-2xl mb-3 text-crimson">
                  {ritual.title}
                </h3>
                <p className="text-sm mb-3 text-foreground/70">
                  {ritual.description}
                </p>
                <p className="text-sm italic text-gold/80">
                  {ritual.significance}
                </p>
              </div>

              {/* Center dot */}
              <div className="absolute left-1/2 -translate-x-1/2 z-10">
                <div className="w-4 h-4 rounded-full border-2 bg-background border-gold" />
              </div>

              {/* Image */}
              <div className={`w-5/12 ${index % 2 === 0 ? "pl-12" : "pr-12"}`}>
                <div className="rounded-xl overflow-hidden shadow-lg gold-border bg-cream">
                  <img 
                    src={ritual.image} 
                    alt={ritual.title}
                    className="w-full h-64 object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile Accordion */}
      <section className="md:hidden py-8 px-4">
        <div className="max-w-lg mx-auto space-y-3">
          {rituals.map((ritual, index) => (
            <div 
              key={index}
              className="rounded-xl overflow-hidden bg-white shadow-sm gold-border"
            >
              <button
                onClick={() => toggleExpand(index)}
                className="w-full flex items-center justify-between p-4 text-left"
                data-testid={`ritual-${index}-toggle`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-gold/20 text-gold">
                    {index + 1}
                  </span>
                  <h3 className="font-serif text-lg text-crimson">
                    {ritual.title}
                  </h3>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-gold transition-transform duration-300 ${
                    expandedIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              {expandedIndex === index && (
                <div className="px-4 pb-4 border-t border-gold/10">
                  {/* Image */}
                  <div className="rounded-lg overflow-hidden my-4 bg-cream">
                    <img 
                      src={ritual.image} 
                      alt={ritual.title}
                      className="w-full h-56 object-contain"
                    />
                  </div>
                  <p className="text-sm mb-3 text-foreground/70">
                    {ritual.description}
                  </p>
                  <p className="text-sm italic text-gold/80">
                    <strong>Significance:</strong> {ritual.significance}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center bg-crimson">
        <p className="font-serif text-sm text-gold/70">
          Shvetha & Aadi • March 2026
        </p>
      </footer>
    </div>
  );
}

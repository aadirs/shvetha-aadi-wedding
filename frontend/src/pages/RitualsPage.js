import { useState } from "react";
import HeritageNav from "../components/HeritageNav";
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
    image: null,
    description: "A day of prayers and preparation where the bride and groom observe fasting and seek blessings from the divine.",
    significance: "Purifies the mind and body, preparing the couple for the sacred union ahead."
  },
  {
    title: "Kasi Yatra",
    image: null,
    description: "The groom pretends to leave for Kasi (Varanasi) to become a sage, but is convinced by the bride's father to embrace married life instead.",
    significance: "Symbolizes the choice of Grihastha (householder) life over Sanyasa (renunciation)."
  },
  {
    title: "Oonjal",
    image: null,
    description: "The couple sits on a decorated swing while married women sing traditional songs and perform aarti.",
    significance: "The swinging represents life's ups and downs, teaching the couple to face them together with balance."
  },
  {
    title: "Kanyadanam",
    image: null,
    description: "The bride's father ceremonially gives his daughter's hand to the groom, with sacred water flowing through their joined hands.",
    significance: "Considered the highest form of danam (gift), symbolizing the parents' trust and blessings."
  },
  {
    title: "Mangalya Dharanam",
    image: null,
    description: "The groom ties the sacred Mangalyam (Thali) around the bride's neck with three knots.",
    significance: "The three knots represent commitment of mind, speech, and body. This is the defining moment of the wedding."
  },
  {
    title: "Sapthapadi",
    image: null,
    description: "The couple takes seven steps together around the sacred fire, each step representing a vow.",
    significance: "Seven vows for food, strength, prosperity, wisdom, progeny, health, and friendship."
  },
  {
    title: "Pradhana Homam",
    image: null,
    description: "The main fire ceremony where offerings are made to Agni (fire god) with sacred mantras.",
    significance: "Agni serves as the divine witness to the marriage vows and carries prayers to the gods."
  },
  {
    title: "Ammi Midithal",
    image: null,
    description: "The bride places her foot on a grinding stone while the groom holds it.",
    significance: "Symbolizes steadfastness—like the stone, the bride should remain firm in her new home."
  },
  {
    title: "Arundhati Nakshatram",
    image: null,
    description: "The couple is shown the stars Arundhati and Vasishta in the night sky.",
    significance: "Arundhati and Vasishta are the ideal couple in Hindu mythology, representing eternal devotion."
  },
  {
    title: "Gruhapravesham",
    image: null,
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
    <div 
      className="min-h-screen"
      style={{ backgroundColor: "#FBF8F3" }}
    >
      <HeritageNav />
      
      {/* Hero Section */}
      <header 
        className="relative py-16 sm:py-24"
        style={{ backgroundColor: "#5C4033" }}
      >
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle cx='30' cy='30' r='20' fill='none' stroke='%23D4AF37' stroke-width='0.5'/%3E%3C/svg%3E")`,
            }}
          />
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <h1 
            className="font-serif text-4xl sm:text-5xl lg:text-6xl mb-4"
            style={{ 
              color: "#D4AF37",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
            data-testid="rituals-title"
          >
            Sacred Ceremonies
          </h1>
          <p 
            className="font-serif text-lg italic"
            style={{ color: "#E8DCC8" }}
          >
            The Vedic Traditions of an Iyer Wedding
          </p>
        </div>
      </header>

      {/* Desktop Timeline */}
      <section className="hidden md:block py-16 px-6">
        <div className="max-w-4xl mx-auto relative">
          {/* Center line */}
          <div 
            className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{ backgroundColor: "#D4AF37", opacity: 0.4 }}
          />

          {rituals.map((ritual, index) => (
            <div 
              key={index}
              className={`relative flex items-center mb-16 ${
                index % 2 === 0 ? "flex-row" : "flex-row-reverse"
              }`}
            >
              {/* Content */}
              <div 
                className={`w-5/12 ${index % 2 === 0 ? "pr-12 text-right" : "pl-12 text-left"}`}
                style={{
                  animation: "fade-in-up 0.6s ease-out forwards",
                  animationDelay: `${index * 100}ms`,
                  opacity: 0,
                }}
              >
                <span 
                  className="inline-block px-3 py-1 text-xs tracking-wider uppercase rounded-full mb-3"
                  style={{ 
                    backgroundColor: "rgba(212, 175, 55, 0.15)",
                    color: "#B8860B",
                  }}
                >
                  Step {index + 1}
                </span>
                <h3 
                  className="font-serif text-2xl mb-3"
                  style={{ 
                    color: "#5C4033",
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  {ritual.title}
                </h3>
                <p className="text-sm mb-3" style={{ color: "#6B5B4F" }}>
                  {ritual.description}
                </p>
                <p 
                  className="text-sm italic"
                  style={{ color: "#8B7355" }}
                >
                  {ritual.significance}
                </p>
              </div>

              {/* Center dot */}
              <div className="absolute left-1/2 -translate-x-1/2 z-10">
                <div 
                  className="w-4 h-4 rounded-full border-2"
                  style={{ 
                    backgroundColor: "#FBF8F3",
                    borderColor: "#D4AF37",
                  }}
                />
              </div>

              {/* Image placeholder */}
              <div className={`w-5/12 ${index % 2 === 0 ? "pl-12" : "pr-12"}`}>
                {ritual.image ? (
                  <img 
                    src={ritual.image} 
                    alt={ritual.title}
                    className="w-full h-48 object-cover rounded-lg"
                    style={{ border: "2px solid rgba(212, 175, 55, 0.3)" }}
                  />
                ) : (
                  <div 
                    className="w-full h-32 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(212, 175, 55, 0.08)" }}
                  >
                    <span 
                      className="font-serif text-4xl"
                      style={{ color: "#D4AF37", opacity: 0.2 }}
                    >
                      {index + 1}
                    </span>
                  </div>
                )}
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
              className="rounded-lg overflow-hidden"
              style={{ 
                backgroundColor: "#FFFFFF",
                border: "1px solid rgba(212, 175, 55, 0.2)",
              }}
            >
              <button
                onClick={() => toggleExpand(index)}
                className="w-full flex items-center justify-between p-4 text-left"
                data-testid={`ritual-${index}-toggle`}
              >
                <div className="flex items-center gap-3">
                  <span 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{ 
                      backgroundColor: "rgba(212, 175, 55, 0.15)",
                      color: "#B8860B",
                    }}
                  >
                    {index + 1}
                  </span>
                  <h3 
                    className="font-serif text-lg"
                    style={{ 
                      color: "#5C4033",
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                  >
                    {ritual.title}
                  </h3>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 transition-transform duration-300 ${
                    expandedIndex === index ? "rotate-180" : ""
                  }`}
                  style={{ color: "#B8860B" }}
                />
              </button>
              
              {expandedIndex === index && (
                <div 
                  className="px-4 pb-4 animate-expand"
                  style={{ borderTop: "1px solid rgba(212, 175, 55, 0.1)" }}
                >
                  <p className="text-sm mb-3 pt-4" style={{ color: "#6B5B4F" }}>
                    {ritual.description}
                  </p>
                  <p 
                    className="text-sm italic"
                    style={{ color: "#8B7355" }}
                  >
                    <strong>Significance:</strong> {ritual.significance}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="py-8 text-center"
        style={{ backgroundColor: "#5C4033" }}
      >
        <p 
          className="font-serif text-sm"
          style={{ color: "#D4AF37", opacity: 0.7 }}
        >
          Shvetha & Aadi • March 2026
        </p>
      </footer>

      <style jsx="true">{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes expand {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }
        .animate-expand {
          animation: expand 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
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
    image: "/Vratham.png",
    description: "Long before the sacred vows of the wedding day, both the bride and groom observe Vratham — a day devoted to spiritual preparation and purification. On this day, family members wake early, perform prayers at home, and tie a protective sacred thread around the wrists of the couple to ward off negative energies. Both the bride and groom fast and sit in prayerful reflection, seeking blessings for a harmonious married life ahead. Through mantras and offerings to deities and ancestors, Vratham becomes a moment of serene focus, grounding the couple in tradition and sanctity long before the wedding rituals begin in earnest.",
    significance: "Vratham purifies the body and mind, inviting divine blessings and preparing the couple spiritually and emotionally for the sacred journey of marriage."
  },
  {
    title: "Kasi Yatra",
    image: "/Kasi_Yatra.png",
    description: "In this playful yet symbolic ritual, the groom dons traditional attire, carries his umbrella, slippers and a walking stick, and theatrically declares his intent to leave for Kasi (Varanasi) in pursuit of spiritual renunciation. As he makes his mock ‘pre-wedding pilgrimage’ towards ascetic life, laughter and anticipation fill the air. The bride’s father steps forward and gently persuades the groom to embrace married life instead, highlighting the beauty and responsibilities of the householder path. This light-hearted enactment allows the groom to set aside any jitters and wholeheartedly commit to his new life with his bride.",
    significance: "Kasi Yatra represents the transition from the solitary pursuit of spiritual life to choosing *grihastha* — the life of a householder — reaffirming the importance of partnership and shared duty."
    },
  {
    title: "Maalai Maatrudhal",
    image: "/Maalai_Maatrudhal.png",
    description: "Once the ceremonial procession arrives at the mandap, the bride and groom are welcomed with garlands brought by their maternal uncles. In a joyful exchange, they attempt to place these garlands around each other’s necks. Amid the laughter and light encouragement from relatives, the couple completes three garland exchanges, symbolizing mutual acceptance. This spirited yet heartfelt moment weaves warmth into the ceremony and visually expresses the beginning of their unity.",
    significance: "The exchange of garlands signifies the bride and groom’s acceptance of each other as companions in life’s journey."
    },
  {
    title: "Oonjal",
    image: "/Oonjal.png",
    description: "The beautifully adorned swing — the *Oonjal* — becomes the centrepiece of a joyful ritual once the couple is seated upon it. Women from both families gather around, singing traditional songs while showering the couple with warmth and blessings. The bride and groom are offered a mixture of banana and milk, symbolizing nourishment and sweetness in married life. Coloured rice balls, prepared with turmeric, are gently placed around the couple or lightly tossed to ward off negative forces. This tradition blends festivity with meaning, infusing laughter, music, and familial affection.",
    significance: "Oonjal represents life’s rhythmic balance — teaching the couple to face life’s ups and downs together with grace and harmony."
    },
  {
    title: "Kanyadanam",
    image: "/Kanyadanam.png",
    description: "Kanyadanam — the giving away of the bride — stands as one of the most emotional moments of the ceremony. The bride’s father places his daughter’s hand into the groom’s hand as Vedic mantras fill the air. A sacred thread is tied around their joined hands, sealing the transfer of responsibility and hope. This gesture not only honors the bride’s upbringing but also entrusts her future and happiness to the union she is entering. The congregation witnesses this profound act of love, trust, and earnest blessings for the couple’s journey ahead.",
    significance: "Kanyadanam symbolizes the parents’ heartfelt blessing and trust as they entrust their daughter into her husband’s care, honoring both duty and devotion."
    },
  {
    title: "Mangalya Dharanam",
    image: "/Mangalya_Dharanam.png",
    description: "To the resonant strains of the nadaswaram, the groom takes the sacred mangalyam (also called thaali), a beautiful necklace signifying marital union. With reverence and devotion, he ties it around the bride’s neck with slow, meaningful precision, often making three sacred knots. Family members shower them with flowers and turmeric rice, while the priest invokes blessings through ancient mantras. This defining moment is heart-stoppingly beautiful — it crystallizes the union between two souls as they step into lifelong partnership.",
    significance: "The tying of the mangalyam symbolizes the bond of marriage — a pledge of love, duty, protection, and shared life ahead."
    },
    {
    title: "Sapthapadi",
    image: "/Sapthapadi.png",
    description: "Sapthapadi — the Seven Steps — is the heart of the wedding vows. Standing before the consecrated fire (Agni), the couple takes seven steps together, each step accompanied by sacred mantras. As they walk side by side, each footfall represents a vow made to one another — for nourishment, strength, prosperity, wisdom, spiritual growth, harmony, and lifelong companionship. This tactile commitment of stepping forward together makes Sapthapadi one of the most spiritually grounding and emotionally resonant parts of the ceremony.",
    significance: "The seven steps embody seven sacred vows, forming the spiritual foundation of the couple’s life together."
    },
  {
    title: "Ammi Midithal",
    image: "/Ammi_Midithal.png",
    description: "After Sapthapadi, the bride gently places her foot on a small grinding stone, and the groom holds it with supportive hands. Though simple in action, the symbolism runs deep: like the firm stone, the bride is encouraged to stand steadfast in her new home. Family and friends look on as this gesture becomes a metaphor for resilience, stability, and an unshakable spirit in the face of life’s uncertainties.",
    significance: "This act symbolizes the bride’s strength and perseverance, qualities essential for a balanced and supportive married life."
    },
  {
    title: "Arundhati Nakshatram",
    image: "/Arundhati_Nakshatram.png",
    description: "As evening descends and stars begin to glitter above, the priest gently directs the couple’s gaze toward the celestial duo of Arundhati and Vasishta. In Hindu mythology, Arundhati and Vasishta represent the ideal marital partnership — devoted, harmonious, and deeply supportive. The bride and groom are reminded of this divine couple’s enduring unity and encouraged to emulate that constancy. This quiet, reflective moment under the night sky anchors the ceremony in cosmic symbolism and shared purpose.",
    significance: "The Arundhati Nakshatram ritual inspires the couple to embody fidelity, devotion, and mutual support throughout their life together."
    }
];

export default function RitualsPage() {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const accordionRefs = useRef([]);

  const toggleExpand = (index) => {
    const isClosing = expandedIndex === index;
    
    if (isClosing) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
      
      // Wait for accordion to fully expand, then scroll to bring it into optimal view
      setTimeout(() => {
        const element = accordionRefs.current[index];
        if (element) {
          const rect = element.getBoundingClientRect();
          const headerHeight = 60; // Account for sticky nav
          const viewportHeight = window.innerHeight;
          const availableHeight = viewportHeight - headerHeight;
          
          // Calculate the ideal scroll position to center the element
          // or at least bring the header near the top with content visible
          const elementTop = rect.top;
          const elementHeight = rect.height;
          
          // If element is taller than viewport, scroll to show header at top
          // Otherwise, try to center it
          let scrollAmount;
          if (elementHeight > availableHeight) {
            // Element is tall - put header near top (with small padding)
            scrollAmount = elementTop - headerHeight - 16;
          } else {
            // Element fits - center it vertically
            const elementCenter = elementTop + (elementHeight / 2);
            const viewportCenter = headerHeight + (availableHeight / 2);
            scrollAmount = elementCenter - viewportCenter;
          }
          
          window.scrollBy({
            top: scrollAmount,
            behavior: 'smooth'
          });
        }
      }, 400); // Wait for accordion animation to complete
    }
  };

  return (
    <div className="min-h-screen mandala-bg">
      <div className="sticky top-0 z-30">
        <HeritageNav />
      </div>
      
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
              ref={(el) => (accordionRefs.current[index] = el)}
              className="rounded-xl overflow-hidden bg-white shadow-sm gold-border"
              style={{ scrollMarginTop: '90px' }}
            >
              <button
                onClick={() => toggleExpand(index)}
                className="w-full flex items-center justify-between p-4 text-left active:bg-gold/5 transition-colors"
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
              
              {/* Expandable Content with proper height animation */}
              <div 
                className="grid transition-all duration-300 ease-in-out"
                style={{
                  gridTemplateRows: expandedIndex === index ? '1fr' : '0fr',
                }}
              >
                <div className="overflow-hidden">
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
                </div>
              </div>
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

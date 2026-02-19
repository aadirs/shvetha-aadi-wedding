import HeritageNav from "../components/HeritageNav";
import { Separator } from "../components/ui/separator";

/*
 * HOW TO UPDATE CONTENT:
 * 
 * 1. Replace image URLs with your actual couple photos
 * 2. Update the storyContent object below with your actual story
 * 3. Add more milestones to the milestones array as needed
 */

// South Indian wedding couple images
const COUPLE_HERO = "https://images.pexels.com/photos/7669966/pexels-photo-7669966.jpeg?auto=compress&cs=tinysrgb&w=1200";
const COUPLE_ENGAGEMENT = "https://images.pexels.com/photos/35441106/pexels-photo-35441106.jpeg?auto=compress&cs=tinysrgb&w=800";
const WEDDING_RITUAL = "https://images.pexels.com/photos/5759233/pexels-photo-5759233.jpeg?auto=compress&cs=tinysrgb&w=800";

const storyContent = {
  heroTitle: "Our Story",
  heroSubtitle: "A journey written in the stars",
  
  howWeMet: {
    title: "How We Met",
    content: `Every love story has its beginning, and ours started with a chance encounter 
    that felt like destiny. What began as a simple conversation blossomed into something 
    beautiful—a connection that deepened with every shared moment, every laugh, and every 
    quiet understanding that passed between us.`,
  },
  
  milestones: [
    {
      title: "The First Meeting",
      date: "Once upon a time",
      description: "Two paths crossed, and everything changed. In that moment, we knew something special had begun.",
      image: COUPLE_ENGAGEMENT,
    },
    {
      title: "The Journey Together", 
      date: "Through the seasons",
      description: "Building memories, sharing dreams, growing together. Every day became a new chapter in our story.",
      image: WEDDING_RITUAL,
    },
    {
      title: "The Question",
      date: "A moment in time",
      description: "When one heart asked another to share forever. And the answer was yes.",
      image: null,
    },
  ],
};

export default function StoryPage() {
  return (
    <div className="min-h-screen mandala-bg">
      <HeritageNav />
      
      {/* Hero Section - matching blessings page style */}
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
            The beginning of forever
          </p>
          <h1 
            className="font-signature text-5xl sm:text-6xl lg:text-7xl text-white mb-4"
            data-testid="story-title"
          >
            {storyContent.heroTitle}
          </h1>
          <p className="text-champagne/80 font-serif italic text-base sm:text-lg">
            {storyContent.heroSubtitle}
          </p>
        </div>
      </header>

      {/* Couple Image Section */}
      <section className="relative -mt-6 mb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div 
            className="rounded-xl overflow-hidden shadow-2xl gold-border"
            data-testid="couple-hero-image"
          >
            <img
              src={COUPLE_HERO}
              alt="Shvetha and Aadi"
              className="w-full h-80 sm:h-[400px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* How We Met */}
      <section className="max-w-3xl mx-auto px-6 mb-16">
        <h2 className="font-serif text-2xl sm:text-3xl text-center mb-6 text-crimson">
          {storyContent.howWeMet.title}
        </h2>
        
        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="w-16 h-px bg-gold" />
          <span className="w-2 h-2 rounded-full bg-gold" />
          <span className="w-16 h-px bg-gold" />
        </div>
        
        <p className="font-serif text-lg leading-relaxed text-center text-foreground/80">
          {storyContent.howWeMet.content}
        </p>
      </section>

      {/* Milestones */}
      <section className="py-16 px-6 bg-crimson/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl text-center mb-12 text-crimson">
            Our Journey
          </h2>

          <div className="space-y-12">
            {storyContent.milestones.map((milestone, index) => (
              <div 
                key={index}
                className={`flex flex-col ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } items-center gap-8`}
              >
                {/* Image or decorative element */}
                <div className="w-full md:w-1/2">
                  {milestone.image ? (
                    <div className="rounded-xl overflow-hidden shadow-lg gold-border">
                      <img
                        src={milestone.image}
                        alt={milestone.title}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  ) : (
                    <div 
                      className="h-48 rounded-xl flex items-center justify-center bg-crimson/10"
                    >
                      <span className="font-signature text-6xl text-gold/30">
                        {index + 1}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <span className="text-sm tracking-wider uppercase text-gold font-semibold">
                    {milestone.date}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl mt-2 mb-3 text-crimson">
                    {milestone.title}
                  </h3>
                  <p className="text-foreground/70">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
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

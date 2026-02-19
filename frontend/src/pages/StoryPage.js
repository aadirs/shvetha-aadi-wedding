import HeritageNav from "../components/HeritageNav";
import { Separator } from "../components/ui/separator";
import { Heart, Music, Coffee, Book, Camera, Plane, Utensils, Dumbbell, Film, Gamepad2 } from "lucide-react";

/*
 * HOW TO UPDATE CONTENT:
 * 
 * 1. Replace bio details for bride and groom below
 * 2. Update funFacts, favorites, and quirks arrays
 * 3. Replace image URLs with actual photos
 */

const brideData = {
  name: "Shvetha",
  role: "The Bride",
  tagline: "The one who plans everything",
  image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Anushka_Sharma_at_Positive_Health_Awards_%28cropped%29.jpg/500px-Anushka_Sharma_at_Positive_Health_Awards_%28cropped%29.jpg",
  bio: "A dreamer with a spreadsheet. Part-time perfectionist, full-time foodie. Believes that every problem can be solved with the right playlist and a cup of chai.",
  funFacts: [
    { icon: Coffee, text: "Runs on filter coffee" },
    { icon: Book, text: "Has 47 unread books" },
    { icon: Music, text: "Shower concert champion" },
  ],
  favorites: {
    movie: "Any romcom ever made",
    food: "Anything her mom makes",
    hobby: "Planning Aadi's life",
  },
  quirk: "Will reorganize your entire kitchen if left unattended",
};

const groomData = {
  name: "Aadi",
  role: "The Groom", 
  tagline: "The one who goes with the flow",
  image: "https://images.pexels.com/photos/35872894/pexels-photo-35872894.jpeg?auto=compress&cs=tinysrgb&w=600",
  bio: "Professional overthinker turned reluctant decision-maker. Firm believer that 'five more minutes' is a valid life philosophy. Still trying to figure out adulting.",
  funFacts: [
    { icon: Gamepad2, text: "Gaming is cardio, right?" },
    { icon: Film, text: "Movie encyclopedia" },
    { icon: Utensils, text: "Biryani connoisseur" },
  ],
  favorites: {
    movie: "Anything with a good twist",
    food: "Biryani (non-negotiable)",
    hobby: "Pretending to work from home",
  },
  quirk: "Can nap anywhere, anytime, any position",
};

const coupleData = {
  image: "/couple-hero.jpg",
  howTheyMet: "What started as awkward small talk turned into 3-hour phone calls, random food adventures, and the realization that they're basically the same person in different fonts.",
  whyTheyWork: [
    "She plans, he shows up (usually on time)",
    "She talks, he listens (and nods at the right moments)", 
    "She dreams big, he dreams of naps",
    "Together, they're chaos with a schedule",
  ],
};

function BioCard({ person, isReversed }) {
  return (
    <div className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 items-center`}>
      {/* Photo */}
      <div className="w-full lg:w-2/5">
        <div className="relative">
          <div className="rounded-2xl overflow-hidden gold-border shadow-xl">
            <img 
              src={person.image} 
              alt={person.name}
              className="w-full h-80 lg:h-96 object-cover"
            />
          </div>
          {/* Name tag */}
          <div 
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full shadow-lg"
            style={{ backgroundColor: '#8B0000' }}
          >
            <span className="font-signature text-2xl text-gold">{person.name}</span>
          </div>
        </div>
      </div>

      {/* Bio Content */}
      <div className="w-full lg:w-3/5 space-y-6">
        {/* Header */}
        <div className="text-center lg:text-left">
          <p className="text-gold uppercase tracking-widest text-xs font-semibold mb-1">{person.role}</p>
          <h2 className="font-signature text-4xl lg:text-5xl text-crimson mb-2">{person.name}</h2>
          <p className="text-foreground/60 italic">"{person.tagline}"</p>
        </div>

        {/* Bio */}
        <p className="text-foreground/80 leading-relaxed">{person.bio}</p>

        {/* Fun Facts */}
        <div className="grid grid-cols-3 gap-3">
          {person.funFacts.map((fact, idx) => (
            <div 
              key={idx}
              className="flex flex-col items-center p-3 rounded-xl text-center"
              style={{ backgroundColor: 'rgba(139, 0, 0, 0.08)' }}
            >
              <fact.icon className="w-5 h-5 text-gold mb-2" />
              <span className="text-xs text-foreground/70">{fact.text}</span>
            </div>
          ))}
        </div>

        {/* Favorites */}
        <div 
          className="p-4 rounded-xl"
          style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
        >
          <p className="text-xs uppercase tracking-wider text-gold font-semibold mb-3">Quick Stats</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Comfort Movie:</span>
              <span className="text-foreground/80">{person.favorites.movie}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Soul Food:</span>
              <span className="text-foreground/80">{person.favorites.food}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Secret Hobby:</span>
              <span className="text-foreground/80">{person.favorites.hobby}</span>
            </div>
          </div>
        </div>

        {/* Quirk */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-crimson/5">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-xs uppercase tracking-wider text-crimson font-semibold mb-1">Warning Label</p>
            <p className="text-sm text-foreground/70">{person.quirk}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoryPage() {
  return (
    <div className="min-h-screen mandala-bg">
      <HeritageNav />
      
      {/* Hero Section */}
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
            Meet the chaos crew
          </p>
          <h1 className="font-signature text-5xl sm:text-6xl lg:text-7xl text-white mb-4">
            Our Story
          </h1>
          <p className="text-champagne/80 font-serif italic text-base sm:text-lg">
            Two weirdos who found each other
          </p>
        </div>
      </header>

      {/* Bride Bio */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <BioCard person={brideData} isReversed={false} />
        </div>
      </section>

      {/* VS Divider */}
      <div className="flex items-center justify-center py-8">
        <div className="w-16 h-px bg-gold/30" />
        <div 
          className="mx-6 w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#8B0000' }}
        >
          <Heart className="w-8 h-8 text-gold fill-gold" />
        </div>
        <div className="w-16 h-px bg-gold/30" />
      </div>

      {/* Groom Bio */}
      <section className="py-16 px-6 bg-crimson/5">
        <div className="max-w-5xl mx-auto">
          <BioCard person={groomData} isReversed={true} />
        </div>
      </section>

      {/* Together Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-gold uppercase tracking-widest text-xs font-semibold mb-2">And then...</p>
            <h2 className="font-signature text-4xl sm:text-5xl text-crimson mb-4">They Found Each Other</h2>
            <div className="flex items-center justify-center gap-3">
              <span className="w-12 h-px bg-gold" />
              <span className="w-2 h-2 rounded-full bg-gold" />
              <span className="w-12 h-px bg-gold" />
            </div>
          </div>

          {/* Couple Image */}
          <div className="mb-12">
            <div className="rounded-2xl overflow-hidden gold-border shadow-2xl">
              <img 
                src={coupleData.image} 
                alt="Shvetha and Aadi together"
                className="w-full h-80 sm:h-[450px] object-cover"
              />
            </div>
          </div>

          {/* How They Met */}
          <div className="text-center mb-12">
            <p className="font-serif text-lg text-foreground/80 leading-relaxed max-w-2xl mx-auto">
              {coupleData.howTheyMet}
            </p>
          </div>

          {/* Why They Work */}
          <div 
            className="p-8 rounded-2xl text-center"
            style={{ backgroundColor: 'rgba(139, 0, 0, 0.05)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
          >
            <p className="text-gold uppercase tracking-widest text-xs font-semibold mb-6">Why It Works</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {coupleData.whyTheyWork.map((reason, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/50"
                >
                  <span className="text-gold">✓</span>
                  <span className="text-sm text-foreground/70 text-left">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 px-6 bg-crimson text-center">
        <p className="font-signature text-3xl text-white mb-2">
          March 6th, 2026
        </p>
        <p className="text-champagne/70 text-sm">
          The day these two officially become each other's problem
        </p>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center bg-crimson">
        <p className="font-serif text-sm text-gold/70">
          Shvetha & Aadi
        </p>
      </footer>
    </div>
  );
}

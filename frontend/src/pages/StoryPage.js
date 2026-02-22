import { useEffect, useRef, useState } from "react";
import HeritageNav from "../components/HeritageNav";
import { Separator } from "../components/ui/separator";
import {
  Heart,
  Music,
  Coffee,
  Book,
  Camera,
  Plane,
  Utensils,
  Dumbbell,
  Film,
  Gamepad2,
  Volume2,
  VolumeX,
  PenTool,
  Flower,
  Swords,
  Candy
} from "lucide-react";

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
  tagline: "Designing spaces. Designing this wedding. Designing Aadi’s life.",
  image: "/bride.png",
  imagePosition: "center 10%",
  bio: "Shvetha is an architect and interior designer with the kind of eye that notices everything, from proportions and lighting to symmetry and the one cushion that is slightly off. She designs homes, wedding cards, aesthetics, and occasionally future plans without informing the people involved. A disciplined yoga practitioner who treats flexibility like a personality trait, she is highly competitive, charmingly dramatic, and fully capable of pretend crying her way to victory if necessary. She loves grand romance and cinematic emotions, and believes every good love story deserves proper pacing and background music. Efficient at binge watching romance dramas, she can survive an entire day with breaks only for food and restroom. Somehow, she chose to fall in love with a man whose idea of romance includes protein calculations.",
  funFacts: [
    { icon: PenTool, text: "Can mentally renovate a space in under a minute" },
    { icon: Flower, text: "Yoga is not optional. It is a lifestyle." },
    { icon: Heart, text: "Can finish an entire romance season in one sitting" },
  ],
  favorites: {
    movie: "Slow-burn romance with dramatic confessions",
    food: "Anything comforting and beautifully made",
    hobby: "Redesigning things that were perfectly fine",
  },
  quirk: "Will break your entire house or at least couple of walls and redesign if left unattended"
};

const groomData = {
  name: "Aadi",
  role: "The Groom",
  tagline: "Powered by data, discipline, and unnecessary amounts of protein.",
  image: "/groom.png",
  imagePosition: "right 55%",
  bio: "Aadi is a data analyst who trusts numbers more than vibes, but somehow ended up engaged to a woman powered entirely by vibes. He lives in spreadsheets, thinks in patterns, and has probably optimised this bio twice already. A mix martial artist who treats training like an anime arc, consistent, intense, mildly dramatic. He loves the gym, loves getting other people into the gym, and will calmly dismantle protein myths whether you asked or not.",
  funFacts: [
    { icon: Dumbbell, text: "Has definitely convinced someone to increase protein intake" },
    { icon: Swords, text: "Mood directly linked to workout frequency" },
    { icon: Candy, text: "Chocolate has a short lifespan around him" },
  ],
  favorites: {
    movie: "Anything anime. Subtitles preferred.",
    food: "Protein. Always protein.",
    hobby: "Recruiting unsuspecting friends into fitness",
  },
  quirk: "Can make food disappear at alarming speed"
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
              style={{ objectPosition: person.imagePosition || 'center center' }}
            />
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
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Play BGM 5 seconds after page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.volume = 0.3;
        audioRef.current.loop = false;
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.log('BGM autoplay blocked:', err));
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = 0.1;
        audioRef.current.muted = false;
      } else {
        audioRef.current.muted = true;
      }
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-screen mandala-bg">
      {/* Background Music */}
      <audio ref={audioRef} src="/story-bgm.mp3" preload="auto" />
      
      {/* Music Control Button - Fixed position */}
      {isPlaying && (
        <button
          onClick={toggleMute}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          style={{ 
            backgroundColor: '#8B0000',
            border: '2px solid #D4AF37'
          }}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-gold" />
          ) : (
            <Volume2 className="w-5 h-5 text-gold" />
          )}
        </button>
      )}

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
            The Couple
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

      {/* Final CTA */}
      <section className="py-6 px-6 bg-crimson text-center">
        <p className="font-signature text-3xl text-white mb-2">
          March 6th, 2026
        </p>
        <p className="text-champagne/70 text-sm">
          The day these two officially becomes each other's problem
        </p>
      </section>

      {/* Footer */}
      <footer className="py-4 text-center bg-crimson">
        <p className="font-serif text-sm text-gold/70">
          Shvetha & Aadi
        </p>
      </footer>
    </div>
  );
}

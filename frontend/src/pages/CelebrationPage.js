import HeritageNav from "../components/HeritageNav";
import { Separator } from "../components/ui/separator";
import { MapPin, Calendar, Clock, ExternalLink } from "lucide-react";

/*
 * HOW TO UPDATE CELEBRATION DETAILS:
 * 
 * Edit the 'weddingDetails' and 'events' objects below.
 * All information is extracted from your wedding invitation.
 */

const weddingDetails = {
  // Couple names
  couple: "Aadi & Shvetha",
  
  // Venue information
  venue: {
    name: "Angana, The Courtyard",
    address: "Pattareddy Palya, Kaggalipura, Kanakapura Road, Bengaluru",
    mapUrl: "https://maps.app.goo.gl/h1Qucmn8o812jmbL9",
  },
  
  // Parent names
  parents: {
    groom: {
      mother: "Mrs. K. Kanthimathi",
      father: "Mr. P.G. Ravindran"
    },
    bride: {
      mother: "Mrs. Usha Ganesh",
      father: "Mr. N. Ganesh"
    }
  }
};

const events = [
  {
    name: "Rasāvali",
    tagline: "An evening of music and dance",
    description: "Under lamps, under stars, join us for an enchanting evening celebrating the union of two families through the timeless arts of music and dance.",
    date: "March 5th, 2026",
    time: "6:30 PM onwards",
    attire: "Ivory, Gold",
    attireNote: "Elegant traditional or semi-formal",
  },
  {
    name: "Muhūrtham",
    tagline: "A sacred beginning",
    description: "Woven with mantras, varnams, and joyful celebration—witness the sacred union as two souls become one in the presence of Agni and loved ones.",
    date: "March 6th, 2026",
    time: "9:00 AM - 10:00 AM",
    attire: "Vibrant Traditionals",
    attireNote: "Traditional South Indian attire in bright colors",
  }
];

export default function CelebrationPage() {
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
            Join us in
          </p>
          <h1 
            className="font-signature text-5xl sm:text-6xl lg:text-7xl text-white mb-4"
            data-testid="celebration-title"
          >
            The Celebration
          </h1>
          <p className="text-champagne/80 font-serif italic text-base sm:text-lg">
            March 5th & 6th, 2026
          </p>
        </div>
      </header>

      {/* Venue Section */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <MapPin className="w-8 h-8 mx-auto mb-4 text-gold" />
            <h2 className="font-serif text-2xl sm:text-3xl mb-2 text-crimson">
              {weddingDetails.venue.name}
            </h2>
            <p className="text-foreground/70">
              {weddingDetails.venue.address}
            </p>
            <a
              href={weddingDetails.venue.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-6 py-2 rounded-full text-sm transition-all hover:shadow-md bg-gold/20 text-crimson font-medium"
              data-testid="venue-map-link"
            >
              <span>View on Google Maps</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Events Schedule */}
      <section className="py-12 px-6 bg-crimson/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl text-center mb-10 text-crimson">
            Schedule of Events
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {events.map((event, index) => (
              <div 
                key={index}
                className="rounded-xl p-6 sm:p-8 bg-white shadow-sm gold-border"
                data-testid={`event-card-${index}`}
              >
                {/* Event Name */}
                <h3 className="font-signature text-3xl sm:text-4xl mb-1 text-crimson">
                  {event.name}
                </h3>
                <p className="font-serif italic text-sm mb-4 text-gold">
                  {event.tagline}
                </p>

                {/* Decorative divider */}
                <div className="w-12 h-px mb-4 bg-gold" />

                {/* Description */}
                <p className="text-sm mb-6 text-foreground/70">
                  {event.description}
                </p>

                {/* Date & Time */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gold" />
                    <span className="text-crimson font-medium">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gold" />
                    <span className="text-crimson font-medium">{event.time}</span>
                  </div>
                </div>

                {/* Dress Code */}
                <div className="rounded-lg p-4 bg-gold/10">
                  <p className="text-xs uppercase tracking-wider mb-1 text-gold font-semibold">
                    Attire
                  </p>
                  <p className="font-medium text-crimson">
                    {event.attire}
                  </p>
                  <p className="text-xs mt-1 text-foreground/60">
                    {event.attireNote}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Families Section */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl sm:text-3xl mb-8 text-crimson">
            With the Blessings of Our Families
          </h2>

          <div className="grid sm:grid-cols-2 gap-8">
            {/* Groom's Family */}
            <div>
              <p className="text-sm uppercase tracking-wider mb-3 text-gold font-semibold">
                Groom's Parents
              </p>
              <p className="font-serif text-lg text-foreground/80">
                {weddingDetails.parents.groom.mother}
              </p>
              <p className="font-serif text-lg text-foreground/80">
                {weddingDetails.parents.groom.father}
              </p>
            </div>

            {/* Bride's Family */}
            <div>
              <p className="text-sm uppercase tracking-wider mb-3 text-gold font-semibold">
                Bride's Parents
              </p>
              <p className="font-serif text-lg text-foreground/80">
                {weddingDetails.parents.bride.mother}
              </p>
              <p className="font-serif text-lg text-foreground/80">
                {weddingDetails.parents.bride.father}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP Placeholder */}
      <section className="py-12 px-6 text-center bg-gold/10">
        <p className="font-signature text-3xl mb-4 text-crimson">
          We look forward to celebrating with you
        </p>
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

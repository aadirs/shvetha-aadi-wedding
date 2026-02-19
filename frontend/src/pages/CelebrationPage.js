import HeritageNav from "../components/HeritageNav";
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
    mapUrl: "https://maps.google.com/?q=Angana+The+Courtyard+Kaggalipura+Bengaluru",
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
    attire: "Ivory, Gold, Off-white",
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
            data-testid="celebration-title"
          >
            The Celebration
          </h1>
          <p 
            className="font-serif text-lg italic"
            style={{ color: "#E8DCC8" }}
          >
            Join us in celebrating this sacred union
          </p>
        </div>
      </header>

      {/* Venue Section */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <MapPin className="w-8 h-8 mx-auto mb-4" style={{ color: "#D4AF37" }} />
            <h2 
              className="font-serif text-2xl sm:text-3xl mb-2"
              style={{ 
                color: "#5C4033",
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              {weddingDetails.venue.name}
            </h2>
            <p style={{ color: "#6B5B4F" }}>
              {weddingDetails.venue.address}
            </p>
            <a
              href={weddingDetails.venue.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-6 py-2 rounded-full text-sm transition-all hover:shadow-md"
              style={{ 
                backgroundColor: "rgba(212, 175, 55, 0.15)",
                color: "#8B7355",
              }}
              data-testid="venue-map-link"
            >
              <span>View on Google Maps</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Events Schedule */}
      <section 
        className="py-12 px-6"
        style={{ backgroundColor: "#F5F0E6" }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 
            className="font-serif text-2xl sm:text-3xl text-center mb-10"
            style={{ 
              color: "#5C4033",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Schedule of Events
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {events.map((event, index) => (
              <div 
                key={index}
                className="rounded-lg p-6 sm:p-8"
                style={{ 
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                }}
                data-testid={`event-card-${index}`}
              >
                {/* Event Name */}
                <h3 
                  className="font-serif text-2xl sm:text-3xl mb-1"
                  style={{ 
                    color: "#5C4033",
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  {event.name}
                </h3>
                <p 
                  className="font-serif italic text-sm mb-4"
                  style={{ color: "#B8860B" }}
                >
                  {event.tagline}
                </p>

                {/* Decorative divider */}
                <div 
                  className="w-12 h-px mb-4"
                  style={{ backgroundColor: "#D4AF37" }}
                />

                {/* Description */}
                <p className="text-sm mb-6" style={{ color: "#6B5B4F" }}>
                  {event.description}
                </p>

                {/* Date & Time */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4" style={{ color: "#B8860B" }} />
                    <span style={{ color: "#5C4033" }}>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4" style={{ color: "#B8860B" }} />
                    <span style={{ color: "#5C4033" }}>{event.time}</span>
                  </div>
                </div>

                {/* Dress Code */}
                <div 
                  className="rounded-lg p-4"
                  style={{ backgroundColor: "rgba(212, 175, 55, 0.08)" }}
                >
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#B8860B" }}>
                    Suggested Attire
                  </p>
                  <p className="font-medium" style={{ color: "#5C4033" }}>
                    {event.attire}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#8B7355" }}>
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
          <h2 
            className="font-serif text-2xl sm:text-3xl mb-8"
            style={{ 
              color: "#5C4033",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            With the Blessings of Our Families
          </h2>

          <div className="grid sm:grid-cols-2 gap-8">
            {/* Groom's Family */}
            <div>
              <p 
                className="text-sm uppercase tracking-wider mb-3"
                style={{ color: "#B8860B" }}
              >
                Groom's Parents
              </p>
              <p className="font-serif text-lg" style={{ color: "#5C4033" }}>
                {weddingDetails.parents.groom.mother}
              </p>
              <p className="font-serif text-lg" style={{ color: "#5C4033" }}>
                {weddingDetails.parents.groom.father}
              </p>
            </div>

            {/* Bride's Family */}
            <div>
              <p 
                className="text-sm uppercase tracking-wider mb-3"
                style={{ color: "#B8860B" }}
              >
                Bride's Parents
              </p>
              <p className="font-serif text-lg" style={{ color: "#5C4033" }}>
                {weddingDetails.parents.bride.mother}
              </p>
              <p className="font-serif text-lg" style={{ color: "#5C4033" }}>
                {weddingDetails.parents.bride.father}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP Placeholder */}
      <section 
        className="py-12 px-6 text-center"
        style={{ backgroundColor: "rgba(212, 175, 55, 0.08)" }}
      >
        <p 
          className="font-serif text-xl mb-4"
          style={{ 
            color: "#5C4033",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          We look forward to celebrating with you
        </p>
        <p className="text-sm" style={{ color: "#8B7355" }}>
          Your presence is the greatest gift
        </p>
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
    </div>
  );
}

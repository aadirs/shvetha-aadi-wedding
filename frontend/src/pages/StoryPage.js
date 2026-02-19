import HeritageNav from "../components/HeritageNav";

// Placeholder images - replace with actual couple photos
const PLACEHOLDER_COUPLE = "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80";
const PLACEHOLDER_ENGAGEMENT = "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80";

/*
 * HOW TO UPDATE CONTENT:
 * 
 * 1. Replace PLACEHOLDER_COUPLE and PLACEHOLDER_ENGAGEMENT URLs with your actual images
 * 2. Update the storyContent object below with your actual story
 * 3. Add more milestones to the milestones array as needed
 */

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
      description: "Two paths crossed, and everything changed.",
      image: PLACEHOLDER_ENGAGEMENT,
    },
    {
      title: "The Journey Together", 
      date: "Through the seasons",
      description: "Building memories, sharing dreams, growing together.",
      image: null,
    },
    {
      title: "The Question",
      date: "A moment in time",
      description: "When one heart asked another to share forever.",
      image: null,
    },
  ],
};

export default function StoryPage() {
  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: "#FBF8F3" }}
    >
      <HeritageNav />
      
      {/* Hero Section */}
      <header 
        className="relative py-20 sm:py-28"
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
            data-testid="story-title"
          >
            {storyContent.heroTitle}
          </h1>
          <p 
            className="font-serif text-lg italic"
            style={{ color: "#E8DCC8" }}
          >
            {storyContent.heroSubtitle}
          </p>
        </div>
      </header>

      {/* Couple Image Section */}
      <section className="relative -mt-10 mb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div 
            className="rounded-lg overflow-hidden shadow-2xl"
            style={{ border: "4px solid #D4AF37" }}
          >
            <img
              src={PLACEHOLDER_COUPLE}
              alt="Shvetha and Aadi"
              className="w-full h-80 sm:h-96 object-cover"
              data-testid="couple-hero-image"
            />
          </div>
        </div>
      </section>

      {/* How We Met */}
      <section className="max-w-3xl mx-auto px-6 mb-16">
        <h2 
          className="font-serif text-2xl sm:text-3xl text-center mb-6"
          style={{ 
            color: "#5C4033",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          {storyContent.howWeMet.title}
        </h2>
        
        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="w-16 h-px" style={{ backgroundColor: "#D4AF37" }} />
          <span 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#D4AF37" }}
          />
          <span className="w-16 h-px" style={{ backgroundColor: "#D4AF37" }} />
        </div>
        
        <p 
          className="font-serif text-lg leading-relaxed text-center"
          style={{ color: "#6B5B4F" }}
        >
          {storyContent.howWeMet.content}
        </p>
      </section>

      {/* Milestones */}
      <section 
        className="py-16 px-6"
        style={{ backgroundColor: "#F5F0E6" }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 
            className="font-serif text-2xl sm:text-3xl text-center mb-12"
            style={{ 
              color: "#5C4033",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
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
                    <div 
                      className="rounded-lg overflow-hidden shadow-lg"
                      style={{ border: "2px solid rgba(212, 175, 55, 0.3)" }}
                    >
                      <img
                        src={milestone.image}
                        alt={milestone.title}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  ) : (
                    <div 
                      className="h-48 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "rgba(212, 175, 55, 0.1)" }}
                    >
                      <span 
                        className="font-serif text-6xl"
                        style={{ color: "#D4AF37", opacity: 0.3 }}
                      >
                        {index + 1}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <span 
                    className="text-sm tracking-wider uppercase"
                    style={{ color: "#B8860B" }}
                  >
                    {milestone.date}
                  </span>
                  <h3 
                    className="font-serif text-xl sm:text-2xl mt-2 mb-3"
                    style={{ 
                      color: "#5C4033",
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                  >
                    {milestone.title}
                  </h3>
                  <p style={{ color: "#6B5B4F" }}>
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
    </div>
  );
}

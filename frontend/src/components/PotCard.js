import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function PotCard({ pot }) {
  const totalRupees = (pot.total_raised_paise || 0) / 100;
  const goalRupees = pot.goal_amount_paise ? pot.goal_amount_paise / 100 : null;
  const progressPct = goalRupees ? Math.min((totalRupees / goalRupees) * 100, 100) : 0;

  return (
    <div className="thamboolam-card group" data-testid={`pot-card-${pot.slug}`}>
      {/* Ornate corner accents */}
      <div className="corner-accent top-2 left-2" />
      <div className="corner-accent top-2 right-2 rotate-90" />
      <div className="corner-accent bottom-2 left-2 -rotate-90" />
      <div className="corner-accent bottom-2 right-2 rotate-180" />

      {/* Arched image frame */}
      <Link to={`/p/${pot.slug}`} className="block px-5 pt-5">
        <div className="arched-frame mx-auto">
          {pot.cover_image_url ? (
            <img
              src={pot.cover_image_url}
              alt={pot.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-crimson/5 flex items-center justify-center">
              <span className="font-signature text-3xl text-crimson/20">S & A</span>
            </div>
          )}
          {/* Inner shadow overlay */}
          <div className="absolute inset-0 rounded-t-[50%] shadow-[inset_0_0_30px_rgba(0,0,0,0.3)]" />
        </div>
      </Link>

      {/* Content area */}
      <div className="px-5 pt-4 pb-5 text-center">
        <Link to={`/p/${pot.slug}`}>
          <h3 className="font-serif text-lg text-foreground mb-1 group-hover:text-crimson transition-colors" data-testid={`pot-title-${pot.slug}`}>
            {pot.title}
          </h3>
        </Link>
        {pot.story_text && (
          <p className="text-muted-foreground text-xs font-sans line-clamp-2 mb-4 leading-relaxed">
            {pot.story_text}
          </p>
        )}

        {/* Brass groove progress bar */}
        {goalRupees && (
          <div className="mb-4">
            <div className="brass-groove mx-auto">
              <div className="brass-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex justify-between text-[11px] font-sans mt-2 px-1">
              <span className="font-medium text-foreground">
                {"\u20B9"}{totalRupees.toLocaleString('en-IN')}
              </span>
              <span className="text-muted-foreground">
                {"\u20B9"}{goalRupees.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}

        {/* Contributors as small initials */}
        {pot.contributor_count > 0 && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex -space-x-1.5">
              {pot.contributor_names?.slice(0, 4).map((name, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full bg-crimson/8 border border-gold/30 flex items-center justify-center"
                  title={name}
                >
                  <span className="text-[9px] font-sans font-bold text-crimson/70">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground font-sans">
              {pot.contributor_count} {pot.contributor_count === 1 ? "blessing" : "blessings"}
            </span>
          </div>
        )}

        {/* CTA: Wax seal button + View */}
        <div className="flex items-center justify-center gap-3">
          <Link to={`/p/${pot.slug}`}>
            <Button variant="outline" className="text-xs font-sans rounded-full border-border/40 hover:border-gold/50 px-5 h-8" data-testid={`view-pot-${pot.slug}`}>
              View Offerings
            </Button>
          </Link>
          <Link to={`/p/${pot.slug}`}>
            <button className="wax-seal" data-testid={`contribute-pot-${pot.slug}`}>
              <span className="wax-seal-text">Gift</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

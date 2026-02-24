import { Heart } from "lucide-react";

export default function ContributorFeed({ contributors }) {
  if (!contributors || contributors.length === 0) {
    return (
      <div className="text-center py-8" data-testid="no-contributors">
        <Heart className="w-8 h-8 text-gold/30 mx-auto mb-2" />
        <p className="text-muted-foreground text-sm font-sans">Be the first to bless the couple</p>
      </div>
    );
  }

  return (
    <div data-testid="contributor-feed">
      <h3 className="font-serif text-lg text-foreground mb-4 flex items-center gap-2">
        <Heart className="w-4 h-4 text-crimson" />
        Wishes ({contributors.length})
      </h3>
      <div className="space-y-3">
        {contributors.map((c, i) => (
          <div key={i} className="flex gap-3 animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }} data-testid={`contributor-${i}`}>
            <div className="w-8 h-8 rounded-full bg-crimson/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-sans font-bold text-crimson">
                {c.donor_name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-sans font-medium text-foreground">{c.donor_name}</p>
              {c.donor_message && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{c.donor_message}</p>
              )}
              {c.paid_at && (
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {new Date(c.paid_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

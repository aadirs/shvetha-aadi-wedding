import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Button } from "../components/ui/button";
import { ShoppingBag } from "lucide-react";

export default function PotCard({ pot }) {
  const { setIsOpen, addItem } = useCart();
  const totalRupees = (pot.total_raised_paise || 0) / 100;
  const goalRupees = pot.goal_amount_paise ? pot.goal_amount_paise / 100 : null;
  const progressPct = goalRupees ? Math.min((totalRupees / goalRupees) * 100, 100) : 0;

  return (
    <div className="bg-card rounded-xl gold-border overflow-hidden card-hover group" data-testid={`pot-card-${pot.slug}`}>
      {/* Cover Image */}
      <Link to={`/p/${pot.slug}`}>
        <div className="relative h-40 sm:h-48 overflow-hidden">
          {pot.cover_image_url ? (
            <img
              src={pot.cover_image_url}
              alt={pot.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-crimson/10 to-gold/10 flex items-center justify-center">
              <span className="font-signature text-3xl text-crimson/30">S & A</span>
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link to={`/p/${pot.slug}`}>
          <h3 className="font-serif text-lg text-foreground mb-1 group-hover:text-crimson transition-colors" data-testid={`pot-title-${pot.slug}`}>
            {pot.title}
          </h3>
        </Link>
        {pot.story_text && (
          <p className="text-muted-foreground text-xs font-sans line-clamp-2 mb-3">
            {pot.story_text}
          </p>
        )}

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs font-sans mb-1">
            <span className="font-medium text-foreground">
              {"\u20B9"}{totalRupees.toLocaleString('en-IN')} raised
            </span>
            {goalRupees && (
              <span className="text-muted-foreground">
                {"\u20B9"}{goalRupees.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          {goalRupees && (
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute inset-0 h-full progress-gold rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}
        </div>

        {/* Contributors */}
        {pot.contributor_count > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex -space-x-2">
              {pot.contributor_names?.slice(0, 4).map((name, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-crimson/10 border-2 border-card flex items-center justify-center"
                  title={name}
                >
                  <span className="text-[10px] font-sans font-bold text-crimson">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground font-sans">
              {pot.contributor_count} {pot.contributor_count === 1 ? "blessing" : "blessings"}
            </span>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-2">
          <Link to={`/p/${pot.slug}`} className="flex-1">
            <Button variant="outline" className="w-full text-xs font-sans rounded-full border-border/40 hover:border-crimson/30" data-testid={`view-pot-${pot.slug}`}>
              View Details
            </Button>
          </Link>
          <Link to={`/p/${pot.slug}`}>
            <Button className="bg-crimson hover:bg-crimson/90 text-white text-xs font-sans rounded-full px-4" data-testid={`contribute-pot-${pot.slug}`}>
              <ShoppingBag className="w-3 h-3 mr-1" /> Gift
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

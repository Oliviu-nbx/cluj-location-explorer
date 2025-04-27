
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Bookmark } from "lucide-react";
import { Location } from "@/types/location";
import { FavoritesService } from "@/services/FavoritesService";
import { useAuth } from "@/components/AuthContext";
import OptimizedImage from "./OptimizedImage";

interface LocationCardProps {
  location: Location;
}

const LocationCard = ({ location }: LocationCardProps) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (user) {
      FavoritesService.checkIsFavorite(location.id)
        .then(setIsFavorite)
        .catch(console.error);
    }
  }, [location.id, user]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const newFavoriteStatus = await FavoritesService.toggleFavorite(location.id);
      setIsFavorite(newFavoriteStatus);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getPriceLevel = (level?: number) => {
    if (!level) return null;
    return "€".repeat(level);
  };

  const imageSrc = location.photos?.length
    ? `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=60`
    : `https://source.unsplash.com/random/800x600/?${location.category.replace('_', '-')}`;

  return (
    <Card className="group h-full overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <OptimizedImage 
          src={imageSrc} 
          alt={`${location.name} in Cluj-Napoca`} 
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {location.priceLevel && (
            <Badge variant="secondary" className="bg-black/50 backdrop-blur-sm text-white border-none">
              {getPriceLevel(location.priceLevel)}
            </Badge>
          )}
          {user && (
            <Button
              size="icon"
              variant="secondary"
              className={`h-8 w-8 bg-black/50 backdrop-blur-sm hover:bg-black/70 ${
                isFavorite ? 'text-red-500' : 'text-white'
              }`}
              onClick={handleToggleFavorite}
            >
              <Bookmark className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              <span className="sr-only">
                {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              </span>
            </Button>
          )}
        </div>
      </div>
      
      <CardContent className="p-4 sm:p-6">
        <Link to={`/${location.category}/${location.slug}`} className="hover:text-primary transition-colors">
          <h3 className="font-display font-bold text-lg sm:text-xl mb-2 line-clamp-2">{location.name}</h3>
        </Link>
        
        <div className="flex items-center gap-2 mb-3">
          {location.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="font-medium">{location.rating.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">
                ({location.userRatingsTotal})
              </span>
            </div>
          )}
          {location.openNow !== undefined && (
            <Badge variant={location.openNow ? "success" : "destructive"} className="ml-auto">
              {location.openNow ? 'Open Now' : 'Closed'}
            </Badge>
          )}
        </div>
        
        <p className="text-muted-foreground text-sm flex items-center gap-2 mb-4">
          <MapPin className="h-4 w-4" />
          {location.address}
        </p>
      </CardContent>
      
      <CardFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
        <Link 
          to={`/${location.category}/${location.slug}`}
          className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
        >
          View Details
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default LocationCard;

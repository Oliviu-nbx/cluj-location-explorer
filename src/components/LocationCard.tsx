
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
    ? `https://source.unsplash.com/random/600x400/?${location.category.replace('_', '-')}`
    : `https://source.unsplash.com/random/600x400/?${location.category.replace('_', '-')}`;

  return (
    <Card className="location-card h-full flex flex-col animate-fade-in">
      <div className="relative h-48">
        <OptimizedImage 
          src={imageSrc} 
          alt={`${location.name} in Cluj-Napoca`} 
          className="h-full w-full"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge variant="secondary">
            {getPriceLevel(location.priceLevel) || "Free"}
          </Badge>
          {user && (
            <Button
              size="icon"
              variant="secondary"
              className={`h-8 w-8 ${isFavorite ? 'bg-primary text-primary-foreground' : ''}`}
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
      
      <CardContent className="py-4 flex-1">
        <Link to={`/${location.category}/${location.slug}`} className="hover:text-primary transition-colors">
          <h3 className="font-display font-bold text-lg mb-2 line-clamp-2">{location.name}</h3>
        </Link>
        
        {location.rating && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="font-medium">{location.rating}</span>
            <span className="text-gray-500 text-sm">
              ({location.userRatingsTotal} reviews)
            </span>
          </div>
        )}
        
        <p className="text-gray-500 text-sm mb-2">{location.address}</p>
        
        {location.openNow !== undefined && (
          <p className={`text-sm ${location.openNow ? 'text-green-600' : 'text-red-600'}`}>
            {location.openNow ? 'Open Now' : 'Closed'}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 pb-4">
        <Link 
          to={`/${location.category}/${location.slug}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
};

export default LocationCard;

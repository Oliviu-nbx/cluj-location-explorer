
import { PlaceInfo } from "@/types/place-info";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Star } from "lucide-react";

interface PlaceAggregatedInfoProps {
  placeInfo: PlaceInfo[];
  compositeScore: number;
}

const PlaceAggregatedInfo = ({ placeInfo, compositeScore }: PlaceAggregatedInfoProps) => {
  const getSourceColor = (source: string) => {
    switch (source) {
      case 'google': return 'bg-red-100 text-red-800';
      case 'booking': return 'bg-blue-100 text-blue-800';
      case 'tripadvisor': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get unique amenities across all sources
  const uniqueAmenities = Array.from(
    new Set(placeInfo.flatMap(info => info.amenities))
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Composite Rating</CardTitle>
          <CardDescription>
            Calculated from multiple review sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
            <span className="text-2xl font-bold">{compositeScore.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              / 5.0
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {placeInfo.map((info) => (
          <Card key={info.source}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize">{info.source}</CardTitle>
                <Badge variant="secondary" className={getSourceColor(info.source)}>
                  {info.rating} / {info.source === 'booking' ? '10' : '5'}
                </Badge>
              </div>
              <CardDescription>
                {info.reviewCount} reviews
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {info.checkInTime && info.checkOutTime && (
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Check-in/out</p>
                    <p className="text-sm text-muted-foreground">
                      {info.checkInTime} - {info.checkOutTime}
                    </p>
                  </div>
                </div>
              )}
              
              {info.neighborhood && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Neighborhood</p>
                    <p className="text-sm text-muted-foreground">
                      {info.neighborhood}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
          <CardDescription>Available at this property</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {uniqueAmenities.map((amenity) => (
              <Badge key={amenity} variant="secondary">
                {amenity}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceAggregatedInfo;

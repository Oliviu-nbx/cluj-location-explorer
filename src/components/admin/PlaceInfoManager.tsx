
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { PlaceInfo, PlaceSource } from "@/types/place-info";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Save, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface PlaceInfoManagerProps {
  locationId: string;
}

const PlaceInfoManager = ({ locationId }: PlaceInfoManagerProps) => {
  const [placeInfo, setPlaceInfo] = useState<PlaceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlaceInfo();
  }, [locationId]);

  const fetchPlaceInfo = async () => {
    const { data, error } = await supabase
      .from('place_info')
      .select('*')
      .eq('location_id', locationId);
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load place information"
      });
      return;
    }

    if (data) {
      setPlaceInfo(data.map(info => ({
        id: info.id,
        locationId: info.location_id,
        source: info.source as PlaceSource,
        rating: info.rating,
        reviewCount: info.review_count,
        priceLevel: info.price_level,
        amenities: info.amenities || [],
        checkInTime: info.check_in_time,
        checkOutTime: info.check_out_time,
        neighborhood: info.neighborhood,
        updatedAt: info.updated_at
      })));
    }
    setLoading(false);
  };

  const handleSave = async (info: PlaceInfo) => {
    setSaving(true);
    const { error } = await supabase
      .from('place_info')
      .upsert({
        id: info.id,
        location_id: locationId,
        source: info.source,
        rating: info.rating,
        review_count: info.reviewCount,
        price_level: info.priceLevel,
        amenities: info.amenities,
        check_in_time: info.checkInTime,
        check_out_time: info.checkOutTime,
        neighborhood: info.neighborhood,
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save place information"
      });
    } else {
      toast({
        title: "Success",
        description: "Place information saved successfully"
      });
      fetchPlaceInfo();
    }
    setSaving(false);
  };

  const handleDelete = async (infoId: string) => {
    const { error } = await supabase
      .from('place_info')
      .delete()
      .eq('id', infoId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete place information"
      });
    } else {
      toast({
        title: "Success",
        description: "Place information deleted successfully"
      });
      fetchPlaceInfo();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">External Sources</h2>
        <Button
          onClick={() => setPlaceInfo([...placeInfo, {
            id: crypto.randomUUID(),
            locationId,
            source: 'google',
            rating: 0,
            reviewCount: 0,
            priceLevel: null,
            amenities: [],
            checkInTime: null,
            checkOutTime: null,
            neighborhood: null,
            updatedAt: new Date().toISOString()
          }])}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {placeInfo.map((info) => (
          <Card key={info.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {info.source}
              </CardTitle>
              <Badge variant="outline">
                {info.updatedAt ? new Date(info.updatedAt).toLocaleDateString() : 'New'}
              </Badge>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={info.rating}
                    onChange={(e) => {
                      const updatedInfo = { ...info, rating: parseFloat(e.target.value) };
                      setPlaceInfo(placeInfo.map(pi => 
                        pi.id === info.id ? updatedInfo : pi
                      ));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Review Count</Label>
                  <Input
                    type="number"
                    value={info.reviewCount}
                    onChange={(e) => {
                      const updatedInfo = { ...info, reviewCount: parseInt(e.target.value) };
                      setPlaceInfo(placeInfo.map(pi => 
                        pi.id === info.id ? updatedInfo : pi
                      ));
                    }}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    onClick={() => handleSave(info)}
                    disabled={saving}
                  >
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button 
                    type="button"
                    variant="destructive"
                    onClick={() => handleDelete(info.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlaceInfoManager;

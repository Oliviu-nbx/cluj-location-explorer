
export type PlaceSource = 'google' | 'booking' | 'tripadvisor';

export interface PlaceInfo {
  id: string;
  locationId: string;
  source: PlaceSource;
  rating: number;
  reviewCount: number;
  priceLevel: number | null;
  amenities: string[];
  checkInTime: string | null;
  checkOutTime: string | null;
  neighborhood: string | null;
  updatedAt: string;
}

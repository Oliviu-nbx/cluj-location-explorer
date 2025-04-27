
export type LocationCategory = 'hotel' | 'bar' | 'restaurant' | 'night_club' | 'tourist_attraction';

export type LocationPhotoReference = {
  photoReference: string;
  width: number;
  height: number;
  attribution?: string;
};

export type LocationReview = {
  authorName: string;
  rating: number;
  text: string;
  time: number;
  profilePhotoUrl?: string;
};

export type LocationOpeningPeriod = {
  open: {
    day: number;
    time: string;
  };
  close: {
    day: number;
    time: string;
  };
};

export interface Location {
  id: string;
  placeId: string;
  name: string;
  slug: string;
  category: LocationCategory;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  openNow?: boolean;
  openingHours?: LocationOpeningPeriod[];
  photos: LocationPhotoReference[];
  types: string[];
  reviews?: LocationReview[];
  editorialSummary?: string;
  lastUpdated: string;
}

export const CATEGORY_LABELS: Record<LocationCategory, string> = {
  hotel: 'Hotels',
  bar: 'Bars',
  restaurant: 'Restaurants',
  night_club: 'Night Clubs',
  tourist_attraction: 'Tourist Attractions'
};

export const CATEGORY_GOOGLE_TYPES: Record<LocationCategory, string> = {
  hotel: 'lodging',
  bar: 'bar',
  restaurant: 'restaurant',
  night_club: 'night_club',
  tourist_attraction: 'tourist_attraction'
};

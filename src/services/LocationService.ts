
import { Location, LocationCategory } from '../types/location';

// This would typically be fetched from an API or database
// For now we're using mock data
const MOCK_LOCATIONS: Location[] = [
  {
    id: '1',
    placeId: 'ChIJXXXXXXXXXXXXXXXXXX',
    name: 'Grand Hotel Italia',
    slug: 'grand-hotel-italia',
    category: 'hotel',
    address: 'Strada Trifoiului 2, Cluj-Napoca 400478, Romania',
    latitude: 46.7667,
    longitude: 23.5949,
    phone: '+40 264 438 990',
    website: 'https://www.grandhotelitaliacluj.ro/',
    rating: 4.5,
    userRatingsTotal: 982,
    priceLevel: 3,
    openNow: true,
    photos: [
      {
        photoReference: 'grand-hotel-1',
        width: 1200,
        height: 800
      }
    ],
    types: ['lodging', 'point_of_interest', 'establishment'],
    reviews: [
      {
        authorName: 'John Doe',
        rating: 5,
        text: 'Excellent hotel with great amenities and friendly staff.',
        time: 1609459200
      }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    id: '2',
    placeId: 'ChIJYYYYYYYYYYYYYYYYYY',
    name: 'Via Restaurant',
    slug: 'via-restaurant',
    category: 'restaurant',
    address: 'Strada Iuliu Maniu 2, Cluj-Napoca 400095, Romania',
    latitude: 46.7697,
    longitude: 23.5891,
    phone: '+40 264 450 255',
    website: 'https://www.viarestaurant.ro/',
    rating: 4.7,
    userRatingsTotal: 1245,
    priceLevel: 2,
    openNow: false,
    photos: [
      {
        photoReference: 'via-restaurant-1',
        width: 1200,
        height: 800
      }
    ],
    types: ['restaurant', 'food', 'point_of_interest', 'establishment'],
    reviews: [
      {
        authorName: 'Jane Smith',
        rating: 4,
        text: 'Delicious food and nice atmosphere. Service could be better.',
        time: 1612137600
      }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    id: '3',
    placeId: 'ChIJZZZZZZZZZZZZZZZZZZ',
    name: "St. Michael's Church",
    slug: 'st-michaels-church',
    category: 'tourist_attraction',
    address: 'Piața Unirii, Cluj-Napoca 400000, Romania',
    latitude: 46.7690,
    longitude: 23.5891,
    rating: 4.8,
    userRatingsTotal: 3245,
    photos: [
      {
        photoReference: 'st-michaels-1',
        width: 1200,
        height: 800
      }
    ],
    types: ['tourist_attraction', 'church', 'place_of_worship', 'point_of_interest'],
    editorialSummary: "St. Michael's Church is a Gothic-style Roman Catholic church in Cluj-Napoca, Romania. It is the second largest church in Transylvania, after the Black Church of Brașov.",
    lastUpdated: new Date().toISOString()
  },
  {
    id: '4',
    placeId: 'ChIJAAAAAAAAAAAAAAAAA',
    name: 'Form Space',
    slug: 'form-space',
    category: 'night_club',
    address: 'Strada Pavel Roșca 8, Cluj-Napoca 400118, Romania',
    latitude: 46.7731,
    longitude: 23.5903,
    phone: '+40 744 991 400',
    website: 'https://form-space.ro/',
    rating: 4.6,
    userRatingsTotal: 987,
    priceLevel: 2,
    openNow: false,
    photos: [
      {
        photoReference: 'form-space-1',
        width: 1200,
        height: 800
      }
    ],
    types: ['night_club', 'bar', 'point_of_interest', 'establishment'],
    lastUpdated: new Date().toISOString()
  },
  {
    id: '5',
    placeId: 'ChIJBBBBBBBBBBBBBBBBBB',
    name: 'Enigma Pub',
    slug: 'enigma-pub',
    category: 'bar',
    address: 'Strada Iuliu Maniu 12, Cluj-Napoca 400095, Romania',
    latitude: 46.7695,
    longitude: 23.5888,
    phone: '+40 742 932 981',
    website: 'https://www.enigmapub.ro/',
    rating: 4.4,
    userRatingsTotal: 743,
    priceLevel: 1,
    openNow: true,
    photos: [
      {
        photoReference: 'enigma-pub-1',
        width: 1200,
        height: 800
      }
    ],
    types: ['bar', 'point_of_interest', 'establishment'],
    lastUpdated: new Date().toISOString()
  }
];

export const LocationService = {
  getAllLocations: (): Promise<Location[]> => {
    return Promise.resolve(MOCK_LOCATIONS);
  },
  
  getLocationsByCategory: (category: LocationCategory): Promise<Location[]> => {
    return Promise.resolve(MOCK_LOCATIONS.filter(location => location.category === category));
  },
  
  getLocationBySlug: (slug: string): Promise<Location | undefined> => {
    return Promise.resolve(MOCK_LOCATIONS.find(location => location.slug === slug));
  },
  
  getLocationById: (id: string): Promise<Location | undefined> => {
    return Promise.resolve(MOCK_LOCATIONS.find(location => location.id === id));
  },
  
  getNearbyLocations: (latitude: number, longitude: number, limit: number = 5): Promise<Location[]> => {
    // In a real implementation, we would calculate distance and sort
    return Promise.resolve(MOCK_LOCATIONS.slice(0, limit));
  }
};

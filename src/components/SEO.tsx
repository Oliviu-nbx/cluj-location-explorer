
import { Helmet } from "react-helmet";
import { Location, LocationCategory, CATEGORY_LABELS } from "@/types/location";

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  location?: Location;
  imageUrl?: string;
  type?: string;
}

// Define interface for structured data to fix TypeScript errors
interface StructuredData {
  "@context": string;
  "@type": string;
  name: string;
  address: {
    "@type": string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  geo: {
    "@type": string;
    latitude: number;
    longitude: number;
  };
  url: string;
  telephone?: string;
  sameAs?: string[];
  aggregateRating?: {
    "@type": string;
    ratingValue: number;
    reviewCount?: number;
  };
  priceRange?: string;
}

const SEO = ({ 
  title,
  description,
  canonicalUrl = window.location.href,
  location,
  imageUrl,
  type = "website"
}: SEOProps) => {
  // Build structured data for locations
  const getStructuredData = () => {
    if (!location) return null;
    
    // Define the Schema.org type based on the location category
    const getSchemaType = (category: LocationCategory) => {
      switch(category) {
        case 'hotel': return 'Hotel';
        case 'restaurant': return 'Restaurant';
        case 'bar': return 'BarOrPub';
        case 'night_club': return 'NightClub';
        case 'tourist_attraction': return 'TouristAttraction';
        default: return 'LocalBusiness';
      }
    };
    
    // Base structured data that all locations share
    const baseStructuredData: StructuredData = {
      "@context": "https://schema.org",
      "@type": getSchemaType(location.category),
      "name": location.name,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": location.address,
        "addressLocality": "Cluj-Napoca",
        "addressRegion": "Cluj",
        "addressCountry": "RO"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": location.latitude,
        "longitude": location.longitude
      },
      "url": canonicalUrl
    };
    
    // Add optional properties if available
    if (location.phone) {
      baseStructuredData.telephone = location.phone;
    }
    
    if (location.website) {
      baseStructuredData.sameAs = [location.website];
    }
    
    if (location.rating) {
      baseStructuredData.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": location.rating,
        "reviewCount": location.userRatingsTotal
      };
    }
    
    if (location.priceLevel) {
      baseStructuredData.priceRange = "€".repeat(location.priceLevel);
    }
    
    return JSON.stringify(baseStructuredData);
  };

  // Build title
  const siteTitle = "Cluj Compass";
  const pageTitle = location 
    ? `${location.name} - ${CATEGORY_LABELS[location.category]} in Cluj Napoca | ${siteTitle}`
    : title 
      ? `${title} | ${siteTitle}` 
      : siteTitle;
      
  // Build description
  const pageDescription = description || location?.editorialSummary || 
    `Discover the best places in Cluj-Napoca. Find hotels, restaurants, bars, nightclubs and tourist attractions with Cluj Compass.`;

  // Build image URL
  const ogImage = imageUrl || location?.photos?.[0]?.photoReference 
    ? `https://source.unsplash.com/random/1200x630/?${location.category.replace('_', '-')}` 
    : "https://clujcompass.ro/og-image.jpg";

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Structured Data for SEO */}
      {location && (
        <script type="application/ld+json">
          {getStructuredData()}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;

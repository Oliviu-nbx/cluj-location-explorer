
import { Helmet } from "react-helmet";
import { Location, LocationCategory, CATEGORY_LABELS } from "@/types/location";

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  location?: Location;
  imageUrl?: string;
  type?: string;
  baseUrl?: string;
}

// Define interface for structured data to fix TypeScript errors
interface StructuredData {
  "@context": string;
  "@type": string;
  "@id"?: string;
  name: string;
  address?: {
    "@type": string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
    postalCode?: string;
  };
  geo?: {
    "@type": string;
    latitude: number;
    longitude: number;
  };
  url: string;
  telephone?: string;
  sameAs?: string[];
  image?: string | string[];
  priceRange?: string;
  aggregateRating?: {
    "@type": string;
    ratingValue: number;
    reviewCount?: number;
    bestRating?: number;
    worstRating?: number;
  };
  openingHoursSpecification?: Array<{
    "@type": string;
    dayOfWeek: string | string[];
    opens: string;
    closes: string;
  }>;
  potentialAction?: {
    "@type": string;
    target: string | { "@type": string; urlTemplate: string };
    "query-input"?: string;
  };
}

interface BreadcrumbItem {
  "@type": string;
  position: number;
  name: string;
  item?: string;
}

interface BreadcrumbList {
  "@context": string;
  "@type": string;
  itemListElement: BreadcrumbItem[];
}

const SEO = ({ 
  title,
  description,
  canonicalUrl,
  location,
  imageUrl,
  type = "website",
  baseUrl = "https://wcompass.ro"
}: SEOProps) => {
  // Normalize baseUrl (remove trailing slash if present)
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  
  // Full canonical URL with domain
  const fullCanonicalUrl = canonicalUrl ? 
    (canonicalUrl.startsWith("http") ? canonicalUrl : `${normalizedBaseUrl}${canonicalUrl.startsWith("/") ? canonicalUrl : `/${canonicalUrl}`}`) : 
    window.location.href;
  
  // Build structured data for locations
  const getStructuredData = (): StructuredData | null => {
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
      "@id": fullCanonicalUrl,
      "name": location.name,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": location.address,
        "addressLocality": "Cluj-Napoca",
        "addressRegion": "Cluj",
        "addressCountry": "RO",
        "postalCode": "400000" // Default postal code for Cluj-Napoca
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": location.latitude,
        "longitude": location.longitude
      },
      "url": fullCanonicalUrl
    };
    
    // Add optional properties if available
    if (location.phone) {
      baseStructuredData.telephone = location.phone;
    }
    
    if (location.website) {
      baseStructuredData.sameAs = [location.website];
    }
    
    // Add image property using actual photos or placeholder
    if (location.photos && location.photos.length > 0) {
      // In a real scenario, we would use actual photo URLs
      baseStructuredData.image = [
        `${normalizedBaseUrl}/images/locations/${location.slug}/main.jpg`,
        `${normalizedBaseUrl}/images/locations/${location.slug}/interior.jpg`
      ];
    } else {
      baseStructuredData.image = `${normalizedBaseUrl}/images/placeholder-${location.category}.jpg`;
    }
    
    if (location.rating) {
      baseStructuredData.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": location.rating,
        "reviewCount": location.userRatingsTotal || 0,
        "bestRating": 5,
        "worstRating": 1
      };
    }
    
    if (location.priceLevel) {
      baseStructuredData.priceRange = "€".repeat(location.priceLevel);
    }
    
    // Add mock opening hours (in a real scenario, this would come from the database)
    baseStructuredData.openingHoursSpecification = [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "22:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Saturday", "Sunday"],
        "opens": "10:00",
        "closes": "23:00"
      }
    ];
    
    return baseStructuredData;
  };
  
  // Generate breadcrumb structured data
  const getBreadcrumbData = (): BreadcrumbList | null => {
    if (!location) return null;
    
    const breadcrumbList: BreadcrumbList = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": normalizedBaseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": CATEGORY_LABELS[location.category],
          "item": `${normalizedBaseUrl}/category/${location.category}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": location.name
        }
      ]
    };
    
    return breadcrumbList;
  };

  // Build organization schema
  const getOrganizationSchema = (): StructuredData => {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "WCompass",
      "url": normalizedBaseUrl,
      "logo": `${normalizedBaseUrl}/logo.png`,
      "sameAs": [
        "https://www.facebook.com/wcompass",
        "https://twitter.com/wcompass",
        "https://www.instagram.com/wcompass"
      ]
    };
  };

  // Build website schema
  const getWebsiteSchema = (): StructuredData => {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "WCompass",
      "url": normalizedBaseUrl,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${normalizedBaseUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };
  };

  // Build title
  const siteTitle = "WCompass";
  const pageTitle = location 
    ? `${location.name} - ${CATEGORY_LABELS[location.category]} in Cluj Napoca | ${siteTitle}`
    : title 
      ? `${title} | ${siteTitle}` 
      : siteTitle;
      
  // Build description
  const pageDescription = description || location?.editorialSummary || 
    `Discover the best places in Cluj-Napoca. Find hotels, restaurants, bars, nightclubs and tourist attractions with WCompass.`;

  // Build image URL
  const ogImage = imageUrl || location?.photos?.[0]?.photoReference 
    ? `https://source.unsplash.com/random/1200x630/?${location?.category.replace('_', '-')}` 
    : `${normalizedBaseUrl}/og-image.jpg`;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="WCompass" />
      <meta property="og:locale" content="ro_RO" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonicalUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Structured Data: Organization and Website (on all pages) */}
      <script type="application/ld+json">
        {JSON.stringify(getOrganizationSchema())}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(getWebsiteSchema())}
      </script>
      
      {/* Structured Data for Location */}
      {location && (
        <script type="application/ld+json">
          {JSON.stringify(getStructuredData())}
        </script>
      )}
      
      {/* Breadcrumb Structured Data */}
      {location && (
        <script type="application/ld+json">
          {JSON.stringify(getBreadcrumbData())}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;

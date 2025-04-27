
import React from "react";
import { Helmet } from "react-helmet";
import { Location, LocationCategory } from "@/types/location";

interface LocationSitemapProps {
  baseUrl: string;
  locations: Location[];
  category: LocationCategory;
}

const LocationSitemap: React.FC<LocationSitemapProps> = ({ baseUrl, locations, category }) => {
  // Remove trailing slash if present
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  return (
    <Helmet>
      <meta http-equiv="Content-Type" content="text/xml; charset=utf-8" />
      {`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${locations.map(location => {
    // Format the lastmod date from location.lastUpdated
    const lastmod = new Date(location.lastUpdated).toISOString().split('T')[0];
    
    return `
  <url>
    <loc>${normalizedBaseUrl}/${category}/${location.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('')}
</urlset>`}
    </Helmet>
  );
};

export default LocationSitemap;

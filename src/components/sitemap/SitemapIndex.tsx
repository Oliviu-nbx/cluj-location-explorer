
import React from "react";
import { Helmet } from "react-helmet";
import { CATEGORY_LABELS } from "@/types/location";

interface SitemapIndexProps {
  baseUrl: string;
}

const SitemapIndex: React.FC<SitemapIndexProps> = ({ baseUrl }) => {
  // Remove trailing slash if present
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  
  // Get current date in W3C format for lastmod
  const today = new Date().toISOString().split('T')[0];

  return (
    <Helmet>
      {/* Set content type to XML */}
      <meta http-equiv="Content-Type" content="text/xml; charset=utf-8" />
      {/* Render the sitemap index XML */}
      {`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${normalizedBaseUrl}/sitemap-pages.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  ${Object.keys(CATEGORY_LABELS).map(category => `
  <sitemap>
    <loc>${normalizedBaseUrl}/sitemap-${category}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`).join('')}
</sitemapindex>`}
    </Helmet>
  );
};

export default SitemapIndex;

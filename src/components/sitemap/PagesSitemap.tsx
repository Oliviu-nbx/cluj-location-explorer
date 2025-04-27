
import React from "react";
import { Helmet } from "react-helmet";
import { LocationCategory, CATEGORY_LABELS } from "@/types/location";

interface PagesSitemapProps {
  baseUrl: string;
}

const PagesSitemap: React.FC<PagesSitemapProps> = ({ baseUrl }) => {
  // Remove trailing slash if present
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  
  // Get current date in W3C format for lastmod
  const today = new Date().toISOString().split('T')[0];

  return (
    <Helmet>
      <meta http-equiv="Content-Type" content="text/xml; charset=utf-8" />
      {`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${normalizedBaseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${Object.entries(CATEGORY_LABELS).map(([category, label]) => `
  <url>
    <loc>${normalizedBaseUrl}/category/${category}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('')}
  <url>
    <loc>${normalizedBaseUrl}/auth</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`}
    </Helmet>
  );
};

export default PagesSitemap;

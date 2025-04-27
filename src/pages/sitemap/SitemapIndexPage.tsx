
import React, { useEffect, useState } from "react";
import SitemapIndex from "@/components/sitemap/SitemapIndex";

const SitemapIndexPage: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState("https://wcompass.ro");

  useEffect(() => {
    // In development, we might want to use the current URL
    if (process.env.NODE_ENV === "development") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  return <SitemapIndex baseUrl={baseUrl} />;
};

export default SitemapIndexPage;

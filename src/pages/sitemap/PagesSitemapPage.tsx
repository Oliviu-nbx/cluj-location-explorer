
import React, { useEffect, useState } from "react";
import PagesSitemap from "@/components/sitemap/PagesSitemap";

const PagesSitemapPage: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState("https://wcompass.ro");

  useEffect(() => {
    // In development, we might want to use the current URL
    if (process.env.NODE_ENV === "development") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  return <PagesSitemap baseUrl={baseUrl} />;
};

export default PagesSitemapPage;

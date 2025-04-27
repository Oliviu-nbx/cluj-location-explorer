
// This file extends the Window interface with Google Analytics properties

interface Window {
  dataLayer?: any[];
  gtag?: (...args: any[]) => void;
}

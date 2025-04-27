
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import PerformanceMonitoringService from './services/PerformanceMonitoringService.ts';
import AnalyticsService from './services/AnalyticsService.ts';

// Start performance monitoring and analytics in production
if (process.env.NODE_ENV === 'production') {
  PerformanceMonitoringService.startMonitoring();
  AnalyticsService.initialize();
}

createRoot(document.getElementById("root")!).render(<App />);

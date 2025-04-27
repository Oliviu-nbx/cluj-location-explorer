import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import PerformanceMonitoringService from './services/PerformanceMonitoringService.ts';
import AnalyticsService from './services/AnalyticsService.ts';
import ErrorLoggingService from './services/ErrorLoggingService.ts';
import EnvironmentService from './services/EnvironmentService.ts';

// Log environment information
console.info('Environment:', EnvironmentService.getEnvironmentInfo());

// Start monitoring and analytics in production
if (process.env.NODE_ENV === 'production') {
  // Initialize services
  ErrorLoggingService.initialize();
  PerformanceMonitoringService.startMonitoring();
  AnalyticsService.initialize();
  
  // Disable console logs in production
  if (!EnvironmentService.isFeatureEnabled('debugMode')) {
    console.log = () => {};
    console.debug = () => {};
    // Keep console.warn and console.error for error logging
  }
} else {
  // In development, still initialize error logging
  ErrorLoggingService.initialize();
}

createRoot(document.getElementById("root")!).render(<App />);

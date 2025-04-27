
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import PerformanceMonitoringService from './services/PerformanceMonitoringService.ts';

// Start performance monitoring
if (process.env.NODE_ENV === 'production') {
  PerformanceMonitoringService.startMonitoring();
}

createRoot(document.getElementById("root")!).render(<App />);

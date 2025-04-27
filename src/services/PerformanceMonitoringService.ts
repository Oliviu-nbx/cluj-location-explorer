
type PerformanceMetric = {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
};

type PerformanceReport = {
  timestamp: number;
  url: string;
  metrics: PerformanceMetric[];
};

class PerformanceMonitoringService {
  private static reports: PerformanceReport[] = [];
  private static isMonitoring = false;
  
  public static startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Listen for navigation events
    window.addEventListener('load', this.capturePerformanceMetrics);
    
    // Listen for user interactions that might trigger route changes
    document.addEventListener('click', this.handleUserInteraction);
  }
  
  public static stopMonitoring(): void {
    this.isMonitoring = false;
    window.removeEventListener('load', this.capturePerformanceMetrics);
    document.removeEventListener('click', this.handleUserInteraction);
  }
  
  private static handleUserInteraction = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    const isNavigationElement = 
      target.tagName === 'A' || 
      target.closest('a') || 
      target.getAttribute('role') === 'link' ||
      target.closest('[role="link"]');
      
    if (isNavigationElement) {
      // Capture metrics before navigation
      this.capturePerformanceMetrics();
    }
  };
  
  private static capturePerformanceMetrics = (): void => {
    if (!window.performance || !window.performance.timing) {
      console.warn('Performance API not supported in this browser');
      return;
    }
    
    setTimeout(() => {
      const timing = window.performance.timing;
      const navigationStart = timing.navigationStart;
      
      const metrics: PerformanceMetric[] = [
        {
          name: 'Page Load Time',
          value: timing.loadEventEnd - navigationStart,
          rating: this.getRating(timing.loadEventEnd - navigationStart, 1000, 3000)
        },
        {
          name: 'DOM Content Loaded',
          value: timing.domContentLoadedEventEnd - navigationStart,
          rating: this.getRating(timing.domContentLoadedEventEnd - navigationStart, 800, 1800)
        },
        {
          name: 'First Paint',
          value: this.getFirstPaint() || 0,
          rating: this.getRating(this.getFirstPaint() || 0, 500, 1500)
        },
        {
          name: 'Time to Interactive',
          value: this.estimateTimeToInteractive(navigationStart),
          rating: this.getRating(this.estimateTimeToInteractive(navigationStart), 1000, 3500)
        }
      ];
      
      const report: PerformanceReport = {
        timestamp: Date.now(),
        url: window.location.href,
        metrics
      };
      
      this.reports.push(report);
      console.info('Performance Report:', report);
      
      // Send metrics to analytics (if implemented)
      this.sendReportToAnalytics(report);
      
      // Clear navigation timing entries to prepare for next navigation
      if (window.performance && window.performance.clearResourceTimings) {
        window.performance.clearResourceTimings();
      }
    }, 0);
  };
  
  private static getFirstPaint(): number | null {
    if (window.performance && window.performance.getEntriesByType) {
      const paintMetrics = window.performance.getEntriesByType('paint');
      const firstPaint = paintMetrics.find(metric => metric.name === 'first-paint');
      return firstPaint ? firstPaint.startTime : null;
    }
    return null;
  }
  
  private static estimateTimeToInteractive(navigationStart: number): number {
    const domReady = window.performance.timing.domContentLoadedEventEnd - navigationStart;
    // This is a simple estimate; in a real app you might use more sophisticated approaches
    return domReady + 500;
  }
  
  private static getRating(value: number, goodThreshold: number, poorThreshold: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= goodThreshold) return 'good';
    if (value <= poorThreshold) return 'needs-improvement';
    return 'poor';
  }
  
  private static sendReportToAnalytics(report: PerformanceReport): void {
    // In a real app, you would send this data to your analytics service
    // For example, Google Analytics, custom backend, etc.
    if (window.gtag) {
      report.metrics.forEach(metric => {
        (window as any).gtag('event', 'performance_metric', {
          metric_name: metric.name,
          metric_value: metric.value,
          metric_rating: metric.rating
        });
      });
    }
  }
  
  public static getReports(): PerformanceReport[] {
    return this.reports;
  }
}

export default PerformanceMonitoringService;

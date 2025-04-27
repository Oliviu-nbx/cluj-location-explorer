
// Analytics event types
export type AnalyticsEvent = {
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
};

// Analytics service for tracking user behavior
class AnalyticsService {
  private static events: AnalyticsEvent[] = [];
  private static isInitialized = false;

  public static initialize(): void {
    if (this.isInitialized) return;
    
    // Initialize Google Analytics (gtag)
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`; // Replace with your GA ID
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer?.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX'); // Replace with your GA ID

    this.isInitialized = true;
    
    // Track page views
    this.trackPageView();
    this.setupEventListeners();
  }

  private static setupEventListeners(): void {
    // Track search events
    document.addEventListener('submit', (e) => {
      const target = e.target as HTMLFormElement;
      if (target.getAttribute('data-analytics') === 'search') {
        this.trackEvent('Search', 'submit', target.querySelector('input')?.value);
      }
    });

    // Track category selection
    document.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      if (target.getAttribute('data-analytics') === 'category') {
        this.trackEvent('Category', 'select', target.value);
      }
    });
  }

  public static trackPageView(): void {
    const event: AnalyticsEvent = {
      category: 'Page',
      action: 'view',
      label: window.location.pathname,
      timestamp: Date.now()
    };
    
    this.events.push(event);
    
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: event.label,
      });
    }
  }

  public static trackEvent(category: string, action: string, label?: string, value?: number): void {
    const event: AnalyticsEvent = {
      category,
      action,
      label,
      value,
      timestamp: Date.now()
    };
    
    this.events.push(event);
    
    if (window.gtag) {
      window.gtag('event', category.toLowerCase(), {
        event_category: category,
        event_action: action,
        event_label: label,
        value: value
      });
    }
  }

  public static getEvents(): AnalyticsEvent[] {
    return this.events;
  }

  public static getEventsByCategory(category: string): AnalyticsEvent[] {
    return this.events.filter(event => event.category === category);
  }
}

export default AnalyticsService;

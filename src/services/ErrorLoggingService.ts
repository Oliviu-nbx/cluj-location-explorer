
// Error logging service for capturing and reporting frontend errors
class ErrorLoggingService {
  private static errors: Array<{
    message: string;
    stack?: string;
    timestamp: number;
    context?: Record<string, any>;
  }> = [];
  private static isInitialized = false;
  
  public static initialize(): void {
    if (this.isInitialized) return;
    
    // Set up global error handlers
    window.addEventListener('error', this.handleGlobalError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    
    // Monkey patch console.error to capture errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.logError(args.join(' '));
      originalConsoleError.apply(console, args);
    };
    
    this.isInitialized = true;
    console.info('Error logging service initialized');
  }
  
  private static handleGlobalError = (event: ErrorEvent): void => {
    this.logError(event.message, event.error?.stack, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  };
  
  private static handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    const error = event.reason;
    this.logError(
      `Unhandled Promise Rejection: ${error?.message || 'Unknown error'}`,
      error?.stack,
      { type: 'unhandledRejection' }
    );
  };
  
  public static logError(message: string, stack?: string, context?: Record<string, any>): void {
    const errorData = {
      message,
      stack,
      timestamp: Date.now(),
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      }
    };
    
    this.errors.push(errorData);
    
    // In production, send to analytics or error reporting service
    if (process.env.NODE_ENV === 'production' && window.gtag) {
      window.gtag?.('event', 'js_error', {
        error_message: message,
        error_stack: stack?.substring(0, 500), // Truncate stack trace to avoid exceeding event size limits
        ...context
      });
    }
  }
  
  public static getErrors(): Array<{
    message: string;
    stack?: string;
    timestamp: number;
    context?: Record<string, any>;
  }> {
    return this.errors;
  }
}

export default ErrorLoggingService;

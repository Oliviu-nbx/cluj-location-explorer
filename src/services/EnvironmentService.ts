
// Environment configuration service
class EnvironmentService {
  // Production flag
  private static isProd = process.env.NODE_ENV === 'production';
  
  // Base URL for APIs based on environment
  private static apiBaseUrl = EnvironmentService.isProd 
    ? 'https://api.yourdomain.com' 
    : 'http://localhost:3000';
  
  // Google Analytics ID
  private static gaId = EnvironmentService.isProd 
    ? 'G-ACTUAL-PRODUCTION-ID'  // Replace with actual production GA ID
    : 'G-DEVELOPMENT-ID';       // Replace with development GA ID
  
  // Feature flags
  private static featureFlags = {
    enableNewFeature: EnvironmentService.isProd ? false : true,
    enablePremiumFeatures: EnvironmentService.isProd ? true : true,
    debugMode: !EnvironmentService.isProd,
  };
  
  // Get API Base URL
  public static getApiBaseUrl(): string {
    return this.apiBaseUrl;
  }
  
  // Get Google Analytics ID
  public static getGAId(): string {
    return this.gaId;
  }
  
  // Check if environment is production
  public static isProduction(): boolean {
    return this.isProd;
  }
  
  // Check if a feature flag is enabled
  public static isFeatureEnabled(featureName: string): boolean {
    return this.featureFlags[featureName as keyof typeof this.featureFlags] || false;
  }
  
  // Get all environment information (for debugging)
  public static getEnvironmentInfo(): Record<string, any> {
    return {
      environment: this.isProd ? 'production' : 'development',
      apiBaseUrl: this.apiBaseUrl,
      featureFlags: this.featureFlags,
      buildTime: import.meta.env.VITE_BUILD_TIME || 'unknown',
      version: import.meta.env.VITE_APP_VERSION || '0.0.1',
    };
  }
}

export default EnvironmentService;


// Backup service for client-side data
class BackupService {
  private static readonly STORAGE_KEY = 'app_state_backup';
  
  // Save a backup of critical client-side state
  public static backup(data: Record<string, any>): void {
    try {
      const backup = {
        data,
        timestamp: Date.now(),
        version: import.meta.env.VITE_APP_VERSION || '0.0.1'
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(backup));
      console.info('Client state backup created');
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  }
  
  // Restore from backup
  public static restore(): Record<string, any> | null {
    try {
      const backupStr = localStorage.getItem(this.STORAGE_KEY);
      if (!backupStr) return null;
      
      const backup = JSON.parse(backupStr);
      console.info(`Restored backup from ${new Date(backup.timestamp).toLocaleString()}`);
      return backup.data;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return null;
    }
  }
  
  // Get backup metadata without restoring
  public static getBackupInfo(): { timestamp: number; version: string } | null {
    try {
      const backupStr = localStorage.getItem(this.STORAGE_KEY);
      if (!backupStr) return null;
      
      const backup = JSON.parse(backupStr);
      return {
        timestamp: backup.timestamp,
        version: backup.version
      };
    } catch {
      return null;
    }
  }
  
  // Clear all backups
  public static clearBackups(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.info('Backups cleared');
  }
}

export default BackupService;

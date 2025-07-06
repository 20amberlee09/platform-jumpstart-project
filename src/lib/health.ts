import { supabase } from '@/integrations/supabase/client';

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  message?: string;
  timestamp: number;
}

export interface SystemHealth {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  services: HealthCheckResult[];
  timestamp: number;
}

class HealthMonitor {
  private checkInterval: NodeJS.Timeout | null = null;
  private listeners: ((health: SystemHealth) => void)[] = [];

  async checkSupabaseHealth(): Promise<HealthCheckResult> {
    const start = performance.now();
    
    try {
      const { error } = await supabase.from('courses').select('id').limit(1);
      const responseTime = performance.now() - start;
      
      if (error) {
        return {
          service: 'supabase',
          status: 'unhealthy',
          responseTime,
          message: error.message,
          timestamp: Date.now()
        };
      }
      
      return {
        service: 'supabase',
        status: responseTime > 1000 ? 'degraded' : 'healthy',
        responseTime,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        service: 'supabase',
        status: 'unhealthy',
        responseTime: performance.now() - start,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  async checkXRPLHealth(): Promise<HealthCheckResult> {
    const start = performance.now();
    
    try {
      // Simple connectivity check - could be expanded based on your XRPL service
      const response = await fetch('https://s1.ripple.com:51234/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'server_info',
          params: [{}]
        })
      });
      
      const responseTime = performance.now() - start;
      
      if (!response.ok) {
        return {
          service: 'xrpl',
          status: 'unhealthy',
          responseTime,
          message: `HTTP ${response.status}`,
          timestamp: Date.now()
        };
      }
      
      return {
        service: 'xrpl',
        status: responseTime > 2000 ? 'degraded' : 'healthy',
        responseTime,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        service: 'xrpl',
        status: 'unhealthy',
        responseTime: performance.now() - start,
        message: error instanceof Error ? error.message : 'Connection failed',
        timestamp: Date.now()
      };
    }
  }

  async checkAPIHealth(): Promise<HealthCheckResult> {
    const start = performance.now();
    
    try {
      // Check if our Supabase Edge Functions are responding
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-welcome-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ healthCheck: true })
      });
      
      const responseTime = performance.now() - start;
      
      return {
        service: 'api',
        status: response.ok ? (responseTime > 1500 ? 'degraded' : 'healthy') : 'unhealthy',
        responseTime,
        message: response.ok ? undefined : `HTTP ${response.status}`,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        service: 'api',
        status: 'unhealthy',
        responseTime: performance.now() - start,
        message: error instanceof Error ? error.message : 'API unreachable',
        timestamp: Date.now()
      };
    }
  }

  async performHealthCheck(): Promise<SystemHealth> {
    const [supabaseHealth, xrplHealth, apiHealth] = await Promise.all([
      this.checkSupabaseHealth(),
      this.checkXRPLHealth(),
      this.checkAPIHealth()
    ]);

    const services = [supabaseHealth, xrplHealth, apiHealth];
    const unhealthyServices = services.filter(s => s.status === 'unhealthy');
    const degradedServices = services.filter(s => s.status === 'degraded');

    let overall: 'healthy' | 'unhealthy' | 'degraded';
    if (unhealthyServices.length > 0) {
      overall = 'unhealthy';
    } else if (degradedServices.length > 0) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    const systemHealth: SystemHealth = {
      overall,
      services,
      timestamp: Date.now()
    };

    // Notify listeners
    this.listeners.forEach(listener => listener(systemHealth));

    return systemHealth;
  }

  startMonitoring(intervalMs: number = 30000) {
    if (this.checkInterval) {
      this.stopMonitoring();
    }

    this.checkInterval = setInterval(() => {
      this.performHealthCheck().catch(error => {
        console.error('Health check failed:', error);
      });
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  onHealthChange(listener: (health: SystemHealth) => void) {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get current system status for dashboard
  async getSystemStatus() {
    const health = await this.performHealthCheck();
    
    return {
      ...health,
      uptime: performance.now(),
      memory: (performance as any).memory ? {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024)
      } : null,
      connection: navigator.onLine ? 'online' : 'offline'
    };
  }
}

export const healthMonitor = new HealthMonitor();

// Convenience functions
export const checkSystemHealth = () => healthMonitor.performHealthCheck();
export const startHealthMonitoring = (interval?: number) => healthMonitor.startMonitoring(interval);
export const stopHealthMonitoring = () => healthMonitor.stopMonitoring();
export const onSystemHealthChange = (callback: (health: SystemHealth) => void) => 
  healthMonitor.onHealthChange(callback);

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart, 
  Bar
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ErrorLoggingService from '@/services/ErrorLoggingService';
import PerformanceMonitoringService from '@/services/PerformanceMonitoringService';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const ErrorMonitoringDashboard = () => {
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week'>('day');
  const errors = ErrorLoggingService.getErrors();
  const performanceReports = PerformanceMonitoringService.getReports();
  
  // Group errors by type/message for visualization
  const getErrorsByType = () => {
    const filtered = getFilteredErrors();
    return Object.entries(
      filtered.reduce((acc, error) => {
        // Use first line of error message as type
        const type = error.message.split('\n')[0].substring(0, 50);
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));
  };
  
  const getFilteredErrors = () => {
    const now = Date.now();
    const ranges = {
      hour: now - 60 * 60 * 1000,
      day: now - 24 * 60 * 60 * 1000,
      week: now - 7 * 24 * 60 * 60 * 1000
    };
    
    return errors.filter(error => error.timestamp >= ranges[timeRange]);
  };
  
  const getPerformanceData = () => {
    return performanceReports.map(report => ({
      timestamp: new Date(report.timestamp).toLocaleTimeString(),
      pageLoad: report.metrics.find(m => m.name === 'Page Load Time')?.value || 0,
      firstPaint: report.metrics.find(m => m.name === 'First Paint')?.value || 0,
      domLoaded: report.metrics.find(m => m.name === 'DOM Content Loaded')?.value || 0
    }));
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Error Monitoring Dashboard</h1>
        <p className="text-muted-foreground">Monitor application errors and performance metrics</p>
      </div>
      
      <div className="flex justify-end mb-4 space-x-2">
        <Button 
          variant={timeRange === 'hour' ? 'default' : 'outline'} 
          onClick={() => setTimeRange('hour')}
          size="sm"
        >
          Last Hour
        </Button>
        <Button 
          variant={timeRange === 'day' ? 'default' : 'outline'} 
          onClick={() => setTimeRange('day')}
          size="sm"
        >
          Last Day
        </Button>
        <Button 
          variant={timeRange === 'week' ? 'default' : 'outline'} 
          onClick={() => setTimeRange('week')}
          size="sm"
        >
          Last Week
        </Button>
      </div>

      <Tabs defaultValue="errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="errors">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Error Count</CardTitle>
                <CardDescription>Total errors logged</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-3xl font-bold">{getFilteredErrors().length}</p>
                  {getFilteredErrors().length > 0 && (
                    <Badge className="ml-2" variant="destructive">Attention needed</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Errors by Type</CardTitle>
                <CardDescription>Error distribution</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getErrorsByType()} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#ff4d4f" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Trends</CardTitle>
                <CardDescription>Error occurrence over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {/* Here would be time series visualization */}
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Not enough data for trend visualization</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Error Log</CardTitle>
              <CardDescription>Detailed list of errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getFilteredErrors().length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No errors logged in the selected time period</p>
                ) : (
                  getFilteredErrors().reverse().map((error, index) => (
                    <div key={index} className="rounded-lg border p-3">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-destructive">{error.message}</h3>
                        <span className="text-sm text-muted-foreground">
                          {new Date(error.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {error.stack && (
                        <pre className="mt-2 overflow-x-auto text-xs p-2 bg-muted rounded">
                          {error.stack}
                        </pre>
                      )}
                      {error.context && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Context:</p>
                          <pre className="text-xs overflow-x-auto p-2 bg-muted rounded">
                            {JSON.stringify(error.context, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Page Load Time</CardTitle>
                <CardDescription>Average load time</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {performanceReports.length > 0 
                    ? `${Math.round(performanceReports.reduce((sum, report) => {
                        const metric = report.metrics.find(m => m.name === 'Page Load Time');
                        return sum + (typeof metric?.value === 'number' ? metric.value : 0);
                      }, 0) / performanceReports.length)}ms` 
                    : 'No data'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key timing metrics</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getPerformanceData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="pageLoad" stroke="#8884d8" name="Page Load" />
                    <Line type="monotone" dataKey="firstPaint" stroke="#82ca9d" name="First Paint" />
                    <Line type="monotone" dataKey="domLoaded" stroke="#ffc658" name="DOM Loaded" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Rating</CardTitle>
                <CardDescription>Overall performance health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  {performanceReports.length > 0 ? (
                    performanceReports[performanceReports.length - 1].metrics.map((metric, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">{metric.name}</span>
                          <span className={`text-sm font-medium ${
                            metric.rating === 'good' ? 'text-green-600' : 
                            metric.rating === 'needs-improvement' ? 'text-amber-600' : 
                            'text-red-600'
                          }`}>
                            {typeof metric.value === 'number' ? `${Math.round(metric.value)}ms` : String(metric.value)}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className={`h-2 ${
                              metric.rating === 'good' ? 'bg-green-500' : 
                              metric.rating === 'needs-improvement' ? 'bg-amber-500' : 
                              'bg-red-500'
                            }`}
                            style={{ 
                              width: `${metric.rating === 'good' ? '100%' : 
                                metric.rating === 'needs-improvement' ? '60%' : '30%'}`
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No performance data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ErrorMonitoringDashboard;

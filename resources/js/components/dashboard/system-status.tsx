import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Server, Database, Wifi, HardDrive } from 'lucide-react';

interface SystemMetric {
    label: string;
    value: number;
    max: number;
    unit: string;
    status: 'healthy' | 'warning' | 'critical';
    icon: React.ComponentType<{ className?: string }>;
}

interface SystemStatusProps {
    metrics?: SystemMetric[];
}

export function SystemStatus({ metrics }: SystemStatusProps) {
    // Default mock data if no metrics provided
    const defaultMetrics: SystemMetric[] = [
        {
            label: 'CPU Usage',
            value: 45,
            max: 100,
            unit: '%',
            status: 'healthy',
            icon: Server,
        },
        {
            label: 'Memory',
            value: 6.8,
            max: 16,
            unit: 'GB',
            status: 'healthy',
            icon: HardDrive,
        },
        {
            label: 'Database Load',
            value: 82,
            max: 100,
            unit: '%',
            status: 'warning',
            icon: Database,
        },
        {
            label: 'Network',
            value: 124,
            max: 1000,
            unit: 'Mbps',
            status: 'healthy',
            icon: Wifi,
        },
    ];

    const systemMetrics = metrics || defaultMetrics;

    const getStatusColor = (status: SystemMetric['status']) => {
        switch (status) {
            case 'healthy':
                return 'default';
            case 'warning':
                return 'secondary';
            case 'critical':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const getProgressColor = (status: SystemMetric['status']) => {
        switch (status) {
            case 'healthy':
                return 'text-green-600';
            case 'warning':
                return 'text-yellow-600';
            case 'critical':
                return 'text-red-600';
            default:
                return 'text-blue-600';
        }
    };

    const calculatePercentage = (value: number, max: number) => {
        return Math.round((value / max) * 100);
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    System Status
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {systemMetrics.map((metric, index) => {
                    const percentage = calculatePercentage(metric.value, metric.max);
                    const Icon = metric.icon;
                    
                    return (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{metric.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        {metric.value}{metric.unit} / {metric.max}{metric.unit}
                                    </span>
                                    <Badge variant={getStatusColor(metric.status)} className="text-xs">
                                        {metric.status}
                                    </Badge>
                                </div>
                            </div>
                            <Progress 
                                value={percentage} 
                                className={`h-2 ${getProgressColor(metric.status)}`}
                            />
                            <div className="text-xs text-muted-foreground text-right">
                                {percentage}% utilized
                            </div>
                        </div>
                    );
                })}
                
                <div className="border-t pt-4 mt-4">
                    <div className="text-xs text-muted-foreground text-center">
                        Last updated: {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, Info, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Alert {
    id: string;
    type: 'info' | 'warning' | 'success' | 'error' | 'maintenance';
    title: string;
    message: string;
    timestamp: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    actionLabel?: string;
    actionHref?: string;
}

interface AlertsPanelProps {
    alerts?: Alert[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
    // Default mock data if no alerts provided
    const defaultAlerts: Alert[] = [
        {
            id: '1',
            type: 'warning',
            title: 'Equipment Maintenance Due',
            message: 'Crane #1245 requires scheduled maintenance within 48 hours',
            timestamp: '2 hours ago',
            priority: 'high',
            actionLabel: 'Schedule',
            actionHref: '/maintenance/schedule',
        },
        {
            id: '2',
            type: 'error',
            title: 'Safety Incident Reported',
            message: 'Minor injury reported at Downtown Site - requires review',
            timestamp: '4 hours ago',
            priority: 'critical',
            actionLabel: 'Review',
            actionHref: '/incidents/review',
        },
        {
            id: '3',
            type: 'info',
            title: 'Weather Alert',
            message: 'Rain expected tomorrow - outdoor jobs may be affected',
            timestamp: '6 hours ago',
            priority: 'medium',
        },
        {
            id: '4',
            type: 'success',
            title: 'Certification Approved',
            message: 'John Smith\'s electrical certification has been approved',
            timestamp: '1 day ago',
            priority: 'low',
        },
        {
            id: '5',
            type: 'maintenance',
            title: 'System Update',
            message: 'Platform maintenance scheduled for tonight 2-4 AM',
            timestamp: '1 day ago',
            priority: 'medium',
        },
    ];

    const alertData = alerts || defaultAlerts;

    const getAlertIcon = (type: Alert['type']) => {
        switch (type) {
            case 'warning':
                return <AlertTriangle className="h-4 w-4" />;
            case 'error':
                return <XCircle className="h-4 w-4" />;
            case 'success':
                return <CheckCircle className="h-4 w-4" />;
            case 'maintenance':
                return <Clock className="h-4 w-4" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    const getAlertColor = (type: Alert['type'], priority: Alert['priority']) => {
        if (priority === 'critical') {
            return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
        }
        
        switch (type) {
            case 'warning':
                return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'error':
                return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
            case 'success':
                return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
            case 'maintenance':
                return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
            default:
                return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
        }
    };

    const getPriorityVariant = (priority: Alert['priority']) => {
        switch (priority) {
            case 'critical':
                return 'destructive';
            case 'high':
                return 'destructive';
            case 'medium':
                return 'secondary';
            case 'low':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Alerts & Notifications
                    </CardTitle>
                    <Badge variant="secondary">{alertData.length}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {alertData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No alerts at this time</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {alertData.map((alert) => (
                            <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border border-sidebar-border/50 hover:bg-muted/50 transition-colors">
                                <div className={`p-2 rounded-full ${getAlertColor(alert.type, alert.priority)}`}>
                                    {getAlertIcon(alert.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium truncate">{alert.title}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                                                <Badge variant={getPriorityVariant(alert.priority)} className="text-xs">
                                                    {alert.priority}
                                                </Badge>
                                            </div>
                                        </div>
                                        {alert.actionLabel && (
                                            <Button size="sm" variant="outline" className="ml-2 text-xs">
                                                {alert.actionLabel}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="border-t pt-3">
                    <Button variant="outline" size="sm" className="w-full">
                        View All Notifications
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

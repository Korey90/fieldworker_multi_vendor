import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from '@inertiajs/react';
import { 
    BarChart3, 
    Users, 
    Briefcase, 
    HardDrive, 
    Package, 
    AlertTriangle,
    CheckCircle,
    XCircle,
    Settings,
    TrendingUp,
    TrendingDown,
    ArrowRight
} from 'lucide-react';

interface QuotaItem {
    id: string;
    quota_type: string;
    quota_limit: number;
    current_usage: number;
    usage_percentage: number;
    status: 'active' | 'warning' | 'exceeded' | 'inactive';
    is_unlimited: boolean;
    is_exceeded: boolean;
}

interface QuotaWidgetProps {
    quotas: QuotaItem[];
    tenantId?: string;
    showActions?: boolean;
    maxVisible?: number;
}

export default function QuotaWidget({ 
    quotas, 
    tenantId, 
    showActions = true, 
    maxVisible = 4 
}: QuotaWidgetProps) {
    const getQuotaIcon = (type: string) => {
        switch (type) {
            case 'users': return <Users className="h-4 w-4" />;
            case 'workers': return <Users className="h-4 w-4" />;
            case 'jobs': return <Briefcase className="h-4 w-4" />;
            case 'assets': return <Package className="h-4 w-4" />;
            case 'storage': return <HardDrive className="h-4 w-4" />;
            default: return <BarChart3 className="h-4 w-4" />;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
            case 'exceeded': return <XCircle className="h-4 w-4 text-red-600" />;
            default: return <XCircle className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-50 border-green-200';
            case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'exceeded': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const formatQuotaType = (type: string) => {
        return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
    };

    const criticalQuotas = quotas.filter(q => q.status === 'exceeded').length;
    const warningQuotas = quotas.filter(q => q.status === 'warning').length;
    const healthyQuotas = quotas.filter(q => q.status === 'active').length;

    const visibleQuotas = quotas.slice(0, maxVisible);
    const hasMoreQuotas = quotas.length > maxVisible;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        <span>Quota Usage</span>
                    </CardTitle>
                    {showActions && (
                        <Link href="/admin/quotas">
                            <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </Link>
                    )}
                </div>
                
                {/* Summary Stats */}
                <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-muted-foreground">{healthyQuotas} Healthy</span>
                    </div>
                    {warningQuotas > 0 && (
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-muted-foreground">{warningQuotas} Warning</span>
                        </div>
                    )}
                    {criticalQuotas > 0 && (
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-muted-foreground">{criticalQuotas} Critical</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
                {quotas.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No quotas configured</p>
                    </div>
                ) : (
                    <>
                        {visibleQuotas.map((quota) => (
                            <div key={quota.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        {getQuotaIcon(quota.quota_type)}
                                        <span className="font-medium text-sm">
                                            {formatQuotaType(quota.quota_type)}
                                        </span>
                                        {getStatusIcon(quota.status)}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-muted-foreground">
                                            {quota.current_usage} / {quota.is_unlimited ? '∞' : quota.quota_limit}
                                        </span>
                                        <Badge variant="outline" className={getStatusColor(quota.status)}>
                                            {quota.status}
                                        </Badge>
                                    </div>
                                </div>
                                
                                {!quota.is_unlimited && (
                                    <div className="space-y-1">
                                        <Progress 
                                            value={Math.min(quota.usage_percentage, 100)} 
                                            className="h-2"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>{quota.usage_percentage.toFixed(1)}% used</span>
                                            {quota.usage_percentage > 80 && (
                                                <span className="text-yellow-600 flex items-center">
                                                    {quota.usage_percentage >= 100 ? (
                                                        <>
                                                            <XCircle className="h-3 w-3 mr-1 text-red-600" />
                                                            Exceeded
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            High usage
                                                        </>
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {hasMoreQuotas && (
                            <div className="pt-2 border-t">
                                <Link href="/admin/quotas">
                                    <Button variant="ghost" size="sm" className="w-full justify-between">
                                        <span>View all {quotas.length} quotas</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                        
                        {/* Quick Actions */}
                        {showActions && (criticalQuotas > 0 || warningQuotas > 0) && (
                            <div className="pt-2 border-t space-y-2">
                                {criticalQuotas > 0 && (
                                    <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200">
                                        <div className="flex items-center space-x-2">
                                            <XCircle className="h-4 w-4 text-red-600" />
                                            <span className="text-sm text-red-700">
                                                {criticalQuotas} quota{criticalQuotas > 1 ? 's' : ''} exceeded
                                            </span>
                                        </div>
                                        <Link href="/admin/quotas?status=exceeded">
                                            <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                                                Fix Now
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                                
                                {warningQuotas > 0 && criticalQuotas === 0 && (
                                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <div className="flex items-center space-x-2">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                            <span className="text-sm text-yellow-700">
                                                {warningQuotas} quota{warningQuotas > 1 ? 's' : ''} near limit
                                            </span>
                                        </div>
                                        <Link href="/admin/quotas?status=warning">
                                            <Button variant="outline" size="sm" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                                                Review
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}